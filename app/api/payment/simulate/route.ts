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

    // Simular pagamento aprovado
    const paymentId = `simulated-${Date.now()}`
    const payment = await simulatePaymentApproval(email, paymentId)
    
    return NextResponse.json({
      success: true,
      message: 'Pagamento simulado com sucesso',
      payment
    })
  } catch (error: any) {
    console.error('Erro ao simular pagamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 