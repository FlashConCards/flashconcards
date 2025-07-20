import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('=== ADICIONANDO FEEDBACK ===')
    
    const { db } = await import('@/app/lib/firebase')
    const { collection, addDoc } = await import('firebase/firestore')
    
    if (!db) {
      return NextResponse.json({ error: 'Firebase não inicializado' })
    }

    // Adicionar feedback de teste
    const feedback = {
      userId: 'claudioghabryel.cg@gmail.com',
      name: 'Claudio Ghabryel',
      rating: 5,
      comment: 'Excelente plataforma! Os flashcards são muito eficientes para estudar. Recomendo para todos que estão se preparando para o concurso da ALEGO.',
      createdAt: new Date().toISOString(),
      isVerified: true
    }

    console.log('Adicionando feedback:', feedback)

    const docRef = await addDoc(collection(db, 'userFeedback'), feedback)
    
    console.log('✅ Feedback adicionado com sucesso! ID:', docRef.id)
    
    return NextResponse.json({
      success: true,
      message: 'Feedback adicionado com sucesso',
      id: docRef.id,
      feedback
    })
    
  } catch (error: any) {
    console.error('❌ Erro ao adicionar feedback:', error)
    return NextResponse.json({
      error: error.message
    }, { status: 500 })
  }
} 