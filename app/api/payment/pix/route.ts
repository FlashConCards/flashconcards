import { NextRequest, NextResponse } from 'next/server'
import { createPixPayment } from '@/app/lib/mercadopago'
import { addPaymentRecord } from '@/app/lib/payments'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, firstName, lastName } = body

    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    const paymentData = {
              transaction_amount: 99.90,
      description: 'FlashConCards ALEGO - R$ 99,90',
      payment_method_id: 'pix' as const,
      payer: {
        email,
        first_name: firstName,
        last_name: lastName
      }
    }

    const result = await createPixPayment(paymentData)

    if (result.success) {
      // Registrar pagamento para o email
      const paymentRecord = {
        email,
        paymentId: result.payment_id?.toString() || 'pix-payment',
        amount: 1.00,
        status: 'pending' as const,
        date: new Date().toISOString(),
        method: 'pix' as const
      }
      
      await addPaymentRecord(paymentRecord)
      
      return NextResponse.json({
        success: true,
        payment_id: result.payment_id,
        qr_code: result.qr_code,
        qr_code_base64: result.qr_code_base64,
        status: result.status
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Erro ao processar pagamento PIX:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 