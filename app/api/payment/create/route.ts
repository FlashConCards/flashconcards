import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'

// Configurar Mercado Pago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '' 
})

export async function POST(request: NextRequest) {
  try {
    const { courseId, userId, amount, paymentMethod } = await request.json()

    // Criar preferência no Mercado Pago
    const preference = new Preference(client)
    const preferenceData = {
      items: [
        {
          id: '1',
          title: `Curso FlashConCards`,
          unit_price: amount,
          quantity: 1,
        },
      ],
      payer: {
        email: 'user@example.com', // Será atualizado com email real
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failure`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/payment/pending`,
      },
      auto_return: 'approved',
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`,
      external_reference: `${userId}_${courseId}`,
    }

    const response = await preference.create({ body: preferenceData })

    // Mock: Salvar pagamento (temporário para deploy)
    const paymentData = {
      userId,
      courseId,
      amount,
      status: 'pending',
      mercadopagoId: response.id,
      paymentMethod,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const paymentRef = { id: 'mock-payment-id' }

    // Se for PIX, gerar QR Code
    if (paymentMethod === 'pix') {
      const payment = new Payment(client)
      const pixResponse = await payment.create({
        body: {
          transaction_amount: amount,
          description: `Curso FlashConCards`,
          payment_method_id: 'pix',
          payer: {
            email: 'user@example.com',
          },
          external_reference: `${userId}_${courseId}`,
        }
      })

      const qrCode = pixResponse.point_of_interaction?.transaction_data?.qr_code
      const qrCodeBase64 = pixResponse.point_of_interaction?.transaction_data?.qr_code_base64

      return NextResponse.json({
        success: true,
        pixQrCode: qrCode,
        pixQrCodeBase64: qrCodeBase64,
        paymentId: paymentRef.id,
      })
    }

    return NextResponse.json({
      success: true,
      paymentUrl: response.init_point,
      paymentId: paymentRef.id,
    })
  } catch (error) {
    console.error('Erro ao criar pagamento:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao processar pagamento' },
      { status: 500 }
    )
  }
} 