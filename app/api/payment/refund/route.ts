import { NextRequest, NextResponse } from 'next/server'
import { getPaymentStatus } from '@/app/lib/mercadopago'
import { updatePaymentStatus } from '@/app/lib/firebase'

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
    const { collection, query, where, getDocs, updateDoc } = await import('firebase/firestore')
    
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
        { error: 'Pagamento não foi aprovado, não é possível reembolsar' },
        { status: 400 }
      )
    }

    // Processar reembolso via Mercado Pago
    const refundResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}/refunds`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: payment.amount,
        reason: reason || 'Solicitação do cliente'
      })
    })

    const refundData = await refundResponse.json()

    if (refundResponse.ok) {
      // Atualizar status no Firebase
      await updatePaymentStatus(paymentId, 'refunded')
      
      // Registrar reembolso
      await updateDoc(querySnapshot.docs[0].ref, {
        refunded_at: new Date().toISOString(),
        refund_reason: reason || 'Solicitação do cliente',
        refund_id: refundData.id
      })

      return NextResponse.json({
        success: true,
        message: 'Reembolso processado com sucesso',
        refund_id: refundData.id,
        amount: payment.amount,
        email
      })
    } else {
      return NextResponse.json(
        { error: 'Erro ao processar reembolso' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Erro ao processar reembolso:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 