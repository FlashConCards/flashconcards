import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Configurar Mercado Pago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '' 
});

export async function POST(request: NextRequest) {
  try {
    const {
      courseId,
      courseName,
      amount,
      paymentMethod,
      userId,
      userEmail,
      userName
    } = await request.json();

    if (!courseId || !courseName || !amount || !userId || !userEmail) {
      return NextResponse.json(
        { error: 'Dados obrigatórios faltando' },
        { status: 400 }
      );
    }

    // Criar preferência de pagamento no Mercado Pago
    const preference = new Preference(client);
    
    const preferenceData = {
      items: [
        {
          title: courseName,
          unit_price: amount,
          quantity: 1,
          currency_id: 'BRL'
        }
      ],
      payer: {
        name: userName || 'Usuário',
        email: userEmail
      },
      external_reference: `${userId}_${courseId}`,
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failure`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/payment/pending`
      },
      auto_return: 'approved',
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`,
      payment_methods: {
        installments: 10, // Até 10x
        excluded_payment_types: paymentMethod === 'pix' ? [
          { id: 'credit_card' },
          { id: 'debit_card' }
        ] : [
          { id: 'pix' }
        ]
      }
    };

    const result = await preference.create({ body: preferenceData });

    console.log('Payment preference created:', result.id);

    return NextResponse.json({
      success: true,
      paymentId: result.id,
      initPoint: result.init_point,
      sandboxInitPoint: result.sandbox_init_point
    });

  } catch (error: any) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Erro ao criar pagamento' },
      { status: 500 }
    );
  }
} 