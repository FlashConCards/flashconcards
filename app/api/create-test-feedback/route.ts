import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('=== CRIANDO FEEDBACK DE TESTE ===')
    
    const { db } = await import('@/app/lib/firebase')
    const { collection, addDoc } = await import('firebase/firestore')
    
    if (!db) {
      return NextResponse.json({ error: 'Firebase não inicializado' })
    }

    // Criar feedback de teste
    const testFeedback = {
      userId: 'test@flashconcards.com',
      name: 'Claudio Ghabryel',
      rating: 5,
      comment: 'Excelente plataforma! Os flashcards são muito eficientes para estudar. Recomendo para todos que estão se preparando para o concurso da ALEGO.',
      createdAt: new Date().toISOString(),
      isVerified: true
    }

    console.log('Salvando feedback de teste:', testFeedback)

    await addDoc(collection(db, 'userFeedback'), testFeedback)
    
    console.log('✅ Feedback de teste criado com sucesso!')
    
    return NextResponse.json({
      success: true,
      message: 'Feedback de teste criado com sucesso',
      feedback: testFeedback
    })
    
  } catch (error: any) {
    console.error('❌ Erro ao criar feedback de teste:', error)
    return NextResponse.json({
      error: error.message
    }, { status: 500 })
  }
} 