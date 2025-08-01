import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

export async function GET() {
  try {
    const client = new MercadoPagoConfig({ 
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
      options: {
        clientId: process.env.MERCADOPAGO_CLIENT_ID,
        clientSecret: process.env.MERCADOPAGO_CLIENT_SECRET
      }
    });

    console.log('Testando credenciais:', {
      accessTokenConfigured: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
      clientIdConfigured: !!process.env.MERCADOPAGO_CLIENT_ID,
      clientSecretConfigured: !!process.env.MERCADOPAGO_CLIENT_SECRET,
      publicKeyConfigured: !!process.env.MERCADOPAGO_PUBLIC_KEY
    });

    const preference = new Preference(client);
    
    // Teste simples
    const testData = {
      items: [
        {
          id: 'test-123',
          title: 'Teste de Pagamento',
          unit_price: 10.00,
          quantity: 1,
          currency_id: 'BRL'
        }
      ],
      payer: {
        name: 'Teste',
        email: 'teste@teste.com'
      }
    };

    const result = await preference.create({ body: testData });

    return NextResponse.json({
      success: true,
      message: 'Token do Mercado Pago está funcionando!',
      preferenceId: result.id,
      credentials: {
        accessTokenConfigured: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
        clientIdConfigured: !!process.env.MERCADOPAGO_CLIENT_ID,
        clientSecretConfigured: !!process.env.MERCADOPAGO_CLIENT_SECRET,
        publicKeyConfigured: !!process.env.MERCADOPAGO_PUBLIC_KEY
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      details: 'Token pode estar inválido ou expirado',
      credentials: {
        accessTokenConfigured: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
        clientIdConfigured: !!process.env.MERCADOPAGO_CLIENT_ID,
        clientSecretConfigured: !!process.env.MERCADOPAGO_CLIENT_SECRET,
        publicKeyConfigured: !!process.env.MERCADOPAGO_PUBLIC_KEY
      }
    }, { status: 500 });
  }
} 