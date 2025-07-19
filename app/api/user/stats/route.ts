import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email não fornecido' },
        { status: 400 }
      )
    }

    // Buscar dados do usuário no Firebase
    const { db } = await import('@/app/lib/firebase')
    const { collection, query, where, getDocs } = await import('firebase/firestore')
    
    if (!db) {
      return NextResponse.json(
        { error: 'Firebase não inicializado' },
        { status: 500 }
      )
    }

    // Buscar progresso do usuário
    const progressQuery = query(collection(db, 'userProgress'), where('userId', '==', email))
    const progressSnapshot = await getDocs(progressQuery)
    
    // Buscar dados do usuário
    const userQuery = query(collection(db, 'users'), where('email', '==', email))
    const userSnapshot = await getDocs(userQuery)
    
    // Calcular estatísticas
    const totalCards = 150 // Total de flashcards disponíveis
    const cardsStudied = progressSnapshot.size
    const generalProgress = Math.round((cardsStudied / totalCards) * 100)
    
    // Calcular dias estudando
    let daysStudying = 1
    if (!userSnapshot.empty) {
      const userData = userSnapshot.docs[0].data()
      if (userData.createdAt) {
        const createdDate = new Date(userData.createdAt)
        const today = new Date()
        const diffTime = Math.abs(today.getTime() - createdDate.getTime())
        daysStudying = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      }
    }
    
    // Último login
    let lastLogin = new Date().toISOString()
    if (!userSnapshot.empty) {
      const userData = userSnapshot.docs[0].data()
      if (userData.lastLogin) {
        lastLogin = userData.lastLogin
      }
    }
    
    const stats = {
      totalCards,
      cardsStudied,
      generalProgress,
      daysStudying,
      lastLogin,
      totalSubjects: 10
    }
    
    return NextResponse.json(stats)
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas do usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 