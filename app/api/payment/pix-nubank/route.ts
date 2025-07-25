import { NextRequest, NextResponse } from 'next/server'
import { createNubankPix } from '@/app/lib/nubank'
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
      amount: 99.90,
      description: 'FlashConCards ALEGO - R$ 99,90',
      payer: {
        name: `${firstName} ${lastName}`,
        email: email,
        cpf: '00000000000' // Em produção, seria o CPF real
      }
    }

    console.log('Criando PIX com Nubank:', paymentData)
    
    const result = await createNubankPix(paymentData)

    if (result.success) {
      // Registrar pagamento no Firebase
      const paymentRecord = {
        email,
        paymentId: result.payment_id || 'nubank-pix-' + Date.now(),
        amount: 99.90,
        status: 'pending' as const,
        date: new Date().toISOString(),
        method: 'pix' as const,
        firstName,
        lastName,
        provider: 'nubank'
      }
      
      await addPaymentRecord(paymentRecord)

      return NextResponse.json({
        success: true,
        payment_id: result.payment_id,
        qr_code: result.qr_code,
        qr_code_base64: result.qr_code_base64,
        status: 'pending',
        provider: 'nubank'
      })
    } else {
      return NextResponse.json(
        { error: result.error || 'Erro ao gerar PIX' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Erro ao processar PIX Nubank:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 