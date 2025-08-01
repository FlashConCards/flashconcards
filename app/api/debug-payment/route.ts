import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

export async function GET() {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const clientId = process.env.MERCADOPAGO_CLIENT_ID;
    const clientSecret = process.env.MERCADOPAGO_CLIENT_SECRET;
    const publicKey = process.env.MERCADOPAGO_PUBLIC_KEY;

    console.log('🔍 Debugando configuração do Mercado Pago:', {
      accessTokenConfigured: !!accessToken,
      clientIdConfigured: !!clientId,
      clientSecretConfigured: !!clientSecret,
      publicKeyConfigured: !!publicKey,
      appUrl: process.env.NEXT_PUBLIC_APP_URL
    });

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'MERCADOPAGO_ACCESS_TOKEN não configurado',
        instructions: [
          '1. Acesse: https://www.mercadopago.com.br/developers',
          '2. Faça login na sua conta',
          '3. Vá em "Suas integrações"',
          '4. Copie o Access Token',
          '5. Adicione no Vercel como MERCADOPAGO_ACCESS_TOKEN'
        ]
      }, { status: 500 });
    }

    // Testar conexão com Mercado Pago
    const client = new MercadoPagoConfig({ 
      accessToken
    });

    // Testar criação de preferência
    const preference = new Preference(client);
    
    const testData = {
      items: [
        {
          id: 'debug-test',
          title: 'Teste de Pagamento',
          unit_price: 10.00,
          quantity: 1,
          currency_id: 'BRL'
        }
      ],
      payer: {
        name: 'Usuário Teste',
        email: 'teste@teste.com'
      },
      external_reference: 'debug_test_123',
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failure`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/payment/pending`
      },
      auto_return: 'approved',
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`
    };

    console.log('🔄 Testando criação de preferência...');
    const preferenceResult = await preference.create({ body: testData });

    // Testar criação de pagamento PIX
    const payment = new Payment(client);
    
    const pixTestData = {
      transaction_amount: 10.00,
      description: 'Teste PIX',
      payment_method_id: 'pix',
      payer: {
        email: 'teste@teste.com',
        first_name: 'Usuário',
        last_name: 'Teste'
      },
      external_reference: 'debug_pix_test_123',
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`
    };

    console.log('🔄 Testando criação de pagamento PIX...');
    const pixResult = await payment.create({ body: pixTestData });

    return NextResponse.json({
      success: true,
      message: 'Sistema de pagamento funcionando corretamente!',
      credentials: {
        accessTokenConfigured: !!accessToken,
        clientIdConfigured: !!clientId,
        clientSecretConfigured: !!clientSecret,
        publicKeyConfigured: !!publicKey
      },
      tests: {
        preferenceCreated: !!preferenceResult.id,
        preferenceId: preferenceResult.id,
        pixCreated: !!pixResult.id,
        pixId: pixResult.id,
        pixQrCode: !!pixResult.point_of_interaction?.transaction_data?.qr_code
      },
      urls: {
        appUrl: process.env.NEXT_PUBLIC_APP_URL,
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
        failureUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failure`,
        webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`
      }
    });

  } catch (error: any) {
    console.error('❌ Erro no debug de pagamento:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      details: 'Verifique as credenciais do Mercado Pago',
      credentials: {
        accessTokenConfigured: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
        clientIdConfigured: !!process.env.MERCADOPAGO_CLIENT_ID,
        clientSecretConfigured: !!process.env.MERCADOPAGO_CLIENT_SECRET,
        publicKeyConfigured: !!process.env.MERCADOPAGO_PUBLIC_KEY
      },
      troubleshooting: [
        '1. Verifique se MERCADOPAGO_ACCESS_TOKEN está configurado no Vercel',
        '2. Confirme se o token não expirou',
        '3. Verifique se está usando o token correto (test ou production)',
        '4. Confirme se NEXT_PUBLIC_APP_URL está configurado'
      ]
    }, { status: 500 });
  }
} 