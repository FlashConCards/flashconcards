import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('=== CRIANDO COLEÇÃO PAYMENTS ===')
    
    const { db } = await import('@/app/lib/firebase')
    const { collection, addDoc } = await import('firebase/firestore')
    
    if (!db) {
      return NextResponse.json({ error: 'Firebase não inicializado' })
    }

    // Criar documento de teste na coleção payments
    const testPayment = {
      payment_id: 'test-recreation-123',
      email: 'test@flashconcards.com',
      first_name: 'Teste',
      last_name: 'Recriação',
      amount: 1.00,
      status: 'pending',
      created_at: new Date().toISOString(),
      payment_method: 'card'
    }

    await addDoc(collection(db, 'payments'), testPayment)
    
    console.log('✅ Coleção payments recriada com sucesso!')
    
    return NextResponse.json({
      success: true,
      message: 'Coleção payments recriada com sucesso',
      testPayment
    })
    
  } catch (error: any) {
    console.error('❌ Erro ao recriar coleção:', error)
    return NextResponse.json({
      error: error.message
    }, { status: 500 })
  }
} 