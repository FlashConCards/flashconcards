import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, subjectId, topicId, cardId, totalCards } = body

    if (!email || !subjectId || !topicId || !cardId) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    // Salvar progresso no Firebase
    const { db } = await import('@/app/lib/firebase')
    const { collection, doc, setDoc, getDoc } = await import('firebase/firestore')
    
    if (!db) {
      return NextResponse.json(
        { error: 'Firebase não inicializado' },
        { status: 500 }
      )
    }

    // Criar ID único para o progresso
    const progressId = `${email}_${subjectId}_${topicId}`
    const progressRef = doc(db, 'userProgress', progressId)

    // Verificar se já existe progresso
    const existingProgress = await getDoc(progressRef)
    
    let completedCards: string[] = []
    if (existingProgress.exists()) {
      const data = existingProgress.data()
      completedCards = data.completedCards || []
    }

    // Adicionar card se não existir
    if (!completedCards.includes(cardId)) {
      completedCards.push(cardId)
    }

    // Salvar progresso atualizado
    await setDoc(progressRef, {
      userId: email,
      subjectId,
      topicId,
      completedCards,
      totalCards: totalCards || 0,
      lastStudied: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      completedCards: completedCards.length,
      totalCards: totalCards || 0
    })
  } catch (error: any) {
    console.error('Erro ao salvar progresso:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 