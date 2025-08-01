import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

// Configurar Mercado Pago com todas as credenciais
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
  options: {
    clientId: process.env.MERCADOPAGO_CLIENT_ID,
    clientSecret: process.env.MERCADOPAGO_CLIENT_SECRET
  }
});

export async function POST(request: NextRequest) {
  try {
    // Verificar se as variáveis de ambiente estão configuradas
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      console.error('❌ MERCADOPAGO_ACCESS_TOKEN não configurado');
      return NextResponse.json(
        { error: 'Configuração de pagamento não encontrada' },
        { status: 500 }
      );
    }

    console.log('✅ Credenciais configuradas:', {
      accessTokenConfigured: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
      clientIdConfigured: !!process.env.MERCADOPAGO_CLIENT_ID,
      clientSecretConfigured: !!process.env.MERCADOPAGO_CLIENT_SECRET,
      publicKeyConfigured: !!process.env.MERCADOPAGO_PUBLIC_KEY
    });

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
      console.error('❌ Dados obrigatórios faltando:', { courseId, courseName, amount, userId, userEmail });
      return NextResponse.json(
        { error: 'Dados obrigatórios faltando' },
        { status: 400 }
      );
    }

    console.log('📦 Dados recebidos:', {
      courseId,
      courseName,
      amount,
      paymentMethod,
      userId,
      userEmail,
      userName
    });

    if (paymentMethod === 'pix') {
      // Criar pagamento PIX direto
      const payment = new Payment(client);
      
      const pixData = {
        transaction_amount: amount,
        description: courseName,
        payment_method_id: 'pix',
        payer: {
          email: userEmail,
          first_name: userName?.split(' ')[0] || 'Usuário',
          last_name: userName?.split(' ').slice(1).join(' ') || ''
        },
        external_reference: `${userId}_${courseId}`,
        notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`
      };

      console.log('🔄 Criando pagamento PIX:', pixData);

      const pixResult = await payment.create({ body: pixData });

      console.log('✅ Pagamento PIX criado:', pixResult.id);

      return NextResponse.json({
        success: true,
        paymentId: pixResult.id,
        pixQrCode: pixResult.point_of_interaction?.transaction_data?.qr_code,
        pixQrCodeBase64: pixResult.point_of_interaction?.transaction_data?.qr_code_base64,
        paymentMethod: 'pix'
      });

    } else {
      // Criar preferência de pagamento para cartão
      const preference = new Preference(client);
      
      const preferenceData = {
        items: [
          {
            id: courseId,
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
          excluded_payment_types: [
            { id: 'pix' }
          ]
        }
      };

      console.log('🔄 Criando preferência de pagamento:', preferenceData);

      const result = await preference.create({ body: preferenceData });

      console.log('✅ Preferência de pagamento criada:', result.id);

      return NextResponse.json({
        success: true,
        paymentId: result.id,
        paymentUrl: result.init_point,
        sandboxUrl: result.sandbox_init_point,
        paymentMethod: 'card'
      });
    }

  } catch (error: any) {
    console.error('❌ Erro ao criar pagamento:', error);
    console.error('❌ Detalhes do erro:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    return NextResponse.json(
      { 
        error: `Erro ao criar pagamento: ${error.message}`,
        details: 'Verifique se as credenciais do Mercado Pago estão corretas'
      },
      { status: 500 }
    );
  }
} 