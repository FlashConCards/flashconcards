import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

export async function GET() {
  try {
    const client = new MercadoPagoConfig({ 
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '' 
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
      preferenceId: result.id
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      details: 'Token pode estar inválido ou expirado'
    }, { status: 500 });
  }
} 