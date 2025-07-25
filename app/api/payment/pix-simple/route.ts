import { NextRequest, NextResponse } from 'next/server'
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

    // Gerar dados simulados do PIX
    const paymentId = 'pix-' + Date.now()
    const qrCode = '00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426614174000520400005303986540599.905802BR5913FlashConCards6009SAO PAULO62070503***6304E2CA'
    
    // Registrar pagamento para o email
    const paymentRecord = {
      email,
      paymentId: paymentId,
      amount: 99.90,
      status: 'pending' as const,
      date: new Date().toISOString(),
      method: 'pix' as const
    }
    
    await addPaymentRecord(paymentRecord)
    
    return NextResponse.json({
      success: true,
      payment_id: paymentId,
      qr_code: qrCode,
      qr_code_base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      status: 'pending',
      message: 'PIX gerado com sucesso! Use o QR code para pagar.'
    })
  } catch (error: any) {
    console.error('Erro ao processar pagamento PIX:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 