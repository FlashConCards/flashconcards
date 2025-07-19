import { NextRequest, NextResponse } from 'next/server'
import { getPaymentStatus } from '@/app/lib/mercadopago'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, reason } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email não fornecido' },
        { status: 400 }
      )
    }

    // Buscar pagamento pelo email
    const { db } = await import('@/app/lib/firebase')
    const { collection, query, where, getDocs, addDoc } = await import('firebase/firestore')
    
    if (!db) {
      return NextResponse.json(
        { error: 'Firebase não inicializado' },
        { status: 500 }
      )
    }

    // Buscar pagamento pelo email
    const q = query(collection(db, 'payments'), where('email', '==', email))
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: 'Nenhum pagamento encontrado para este email' },
        { status: 404 }
      )
    }

    const payment = querySnapshot.docs[0].data()
    const paymentId = payment.payment_id
    
    // Verificar se pagamento foi aprovado
    const result = await getPaymentStatus(paymentId)
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Erro ao verificar status do pagamento' },
        { status: 400 }
      )
    }

    if (result.status !== 'approved') {
      return NextResponse.json(
        { error: 'Pagamento não foi aprovado, não é possível solicitar reembolso' },
        { status: 400 }
      )
    }

    // Criar solicitação de reembolso (pendente de aprovação)
    const refundRequest = {
      email,
      payment_id: paymentId,
      amount: payment.amount,
      reason: reason || 'Solicitação do cliente',
      status: 'pending',
      created_at: new Date().toISOString(),
      method: payment.method
    }

    await addDoc(collection(db, 'refund_requests'), refundRequest)
    
    console.log('Solicitação de reembolso criada para:', email)

    return NextResponse.json({
      success: true,
      message: 'Solicitação de reembolso enviada com sucesso! Aguarde a aprovação.',
      email,
      amount: payment.amount
    })
  } catch (error: any) {
    console.error('Erro ao criar solicitação de reembolso:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 