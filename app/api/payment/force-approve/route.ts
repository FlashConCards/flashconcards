import { NextRequest, NextResponse } from 'next/server'
import { simulatePaymentApproval } from '@/app/lib/payments'

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

    // Forçar pagamento aprovado
    const paymentId = `forced-${Date.now()}`
    const payment = await simulatePaymentApproval(email, paymentId)
    
    console.log('Pagamento forçado aprovado para:', email, payment)
    
    return NextResponse.json({
      success: true,
      message: 'Pagamento FORÇADO aprovado com sucesso!',
      payment,
      email
    })
  } catch (error: any) {
    console.error('Erro ao forçar pagamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 