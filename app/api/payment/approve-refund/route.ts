import { NextRequest, NextResponse } from 'next/server'
import { updatePaymentStatus } from '@/app/lib/firebase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { refundId, action } = body // action: 'approve' ou 'reject'

    if (!refundId || !action) {
      return NextResponse.json(
        { error: 'ID do reembolso e ação são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar solicitação de reembolso
    const { db } = await import('@/app/lib/firebase')
    const { collection, doc, getDoc, updateDoc } = await import('firebase/firestore')
    
    if (!db) {
      return NextResponse.json(
        { error: 'Firebase não inicializado' },
        { status: 500 }
      )
    }

    // Buscar solicitação de reembolso
    const refundRef = doc(db, 'refund_requests', refundId)
    const refundDoc = await getDoc(refundRef)
    
    if (!refundDoc.exists()) {
      return NextResponse.json(
        { error: 'Solicitação de reembolso não encontrada' },
        { status: 404 }
      )
    }

    const refundData = refundDoc.data()

    if (action === 'approve') {
      // Processar reembolso via Mercado Pago
      const refundResponse = await fetch(`https://api.mercadopago.com/v1/payments/${refundData.payment_id}/refunds`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: refundData.amount,
          reason: refundData.reason
        })
      })

      const refundResult = await refundResponse.json()

      if (refundResponse.ok) {
        // Atualizar status do pagamento para refunded
        await updatePaymentStatus(refundData.payment_id, 'refunded')
        
        // Atualizar solicitação de reembolso
        await updateDoc(refundRef, {
          status: 'approved',
          approved_at: new Date().toISOString(),
          refund_id: refundResult.id
        })

        return NextResponse.json({
          success: true,
          message: 'Reembolso aprovado e processado com sucesso',
          refund_id: refundResult.id,
          amount: refundData.amount,
          email: refundData.email
        })
      } else {
        return NextResponse.json(
          { error: 'Erro ao processar reembolso no Mercado Pago' },
          { status: 400 }
        )
      }
    } else if (action === 'reject') {
      // Rejeitar solicitação
      await updateDoc(refundRef, {
        status: 'rejected',
        rejected_at: new Date().toISOString()
      })

      return NextResponse.json({
        success: true,
        message: 'Solicitação de reembolso rejeitada',
        email: refundData.email
      })
    } else {
      return NextResponse.json(
        { error: 'Ação inválida' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Erro ao processar aprovação de reembolso:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 