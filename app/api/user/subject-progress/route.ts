import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, subjectId } = body

    if (!email || !subjectId) {
      return NextResponse.json(
        { error: 'Email e subjectId são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar progresso específico da matéria no Firebase
    const { db } = await import('@/app/lib/firebase')
    const { collection, query, where, getDocs } = await import('firebase/firestore')
    
    if (!db) {
      return NextResponse.json(
        { error: 'Firebase não inicializado' },
        { status: 500 }
      )
    }

    // Buscar progresso da matéria específica
    const progressQuery = query(
      collection(db, 'userProgress'), 
      where('userId', '==', email),
      where('subjectId', '==', subjectId)
    )
    const progressSnapshot = await getDocs(progressQuery)
    
    let completedCards = 0
    let totalCards = 0
    
    // Definir total de cards por matéria
    const subjectCards = {
      'portugues': 120,
      'informatica': 80,
      'constitucional': 150,
      'administrativo': 130,
      'realidade-goias': 90,
      'legislacao-alego': 70
    }
    
    totalCards = subjectCards[subjectId as keyof typeof subjectCards] || 0
    
    // Contar cards completados
    if (!progressSnapshot.empty) {
      progressSnapshot.forEach(doc => {
        const data = doc.data()
        if (data.completedCards) {
          completedCards += data.completedCards.length
        }
      })
    }
    
    const progress = {
      subjectId,
      completedCards,
      totalCards,
      percentage: totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0
    }
    
    return NextResponse.json(progress)
  } catch (error: any) {
    console.error('Erro ao buscar progresso da matéria:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 