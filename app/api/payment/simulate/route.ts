import { NextRequest, NextResponse } from 'next/server'
import { simulatePaymentApproval } from '@/app/lib/payments'
import { createAuthUser } from '@/app/lib/firebase'

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
    
    // Criar usuário no Firebase Authentication
    const password = 'souflashconcards'
    const authUser = await createAuthUser(email, password)
    
    return NextResponse.json({
      success: true,
      message: 'Pagamento simulado e usuário criado com sucesso',
      payment,
      authUser: authUser ? 'created' : 'already_exists'
    })
  } catch (error: any) {
    console.error('Erro ao simular pagamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 