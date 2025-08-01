import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || ''
});

export async function GET(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    const { paymentId } = params;

    if (!paymentId) {
      return NextResponse.json(
        { error: 'ID do pagamento não fornecido' },
        { status: 400 }
      );
    }

    const preference = new Preference(client);
    const result = await preference.get({ preferenceId: paymentId });

    return NextResponse.json({
      success: true,
      initPoint: result.init_point,
      sandboxInitPoint: result.sandbox_init_point,
      preferenceId: result.id
    });

  } catch (error: any) {
    console.error('Error getting preference:', error);
    
    return NextResponse.json(
      { error: `Erro ao buscar preferência: ${error.message}` },
      { status: 500 }
    );
  }
} 