import { NextRequest, NextResponse } from 'next/server'
import { updatePaymentStatus } from '@/app/lib/payments'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { data } = body
    
    if (!data || !data.id) {
      return NextResponse.json(
        { error: 'Dados do webhook inválidos' },
        { status: 400 }
      )
    }

    const paymentId = data.id.toString()
    const status = data.status || 'pending'
    
    // Atualizar status do pagamento
    await updatePaymentStatus(paymentId, status)
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao processar webhook:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 