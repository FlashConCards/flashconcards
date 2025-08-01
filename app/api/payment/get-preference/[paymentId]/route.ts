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

    console.log('🔍 Buscando preferência:', { paymentId });

    if (!paymentId) {
      console.error('❌ ID do pagamento não fornecido');
      return NextResponse.json(
        { error: 'ID do pagamento não fornecido' },
        { status: 400 }
      );
    }

    // Verificar se o access token está configurado
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      console.error('❌ MERCADOPAGO_ACCESS_TOKEN não configurado');
      return NextResponse.json(
        { error: 'Configuração de pagamento não encontrada' },
        { status: 500 }
      );
    }

    console.log('✅ Credenciais configuradas, buscando preferência...');

    const preference = new Preference(client);
    
    try {
      const result = await preference.get({ preferenceId: paymentId });
      
      console.log('✅ Preferência encontrada:', result.id);

      return NextResponse.json({
        success: true,
        initPoint: result.init_point,
        sandboxInitPoint: result.sandbox_init_point,
        preferenceId: result.id
      });

    } catch (preferenceError: any) {
      console.error('❌ Erro ao buscar preferência:', preferenceError);
      
      // Se a preferência não existe, pode ser um pagamento PIX
      if (preferenceError.message?.includes('not found') || preferenceError.status === 404) {
        return NextResponse.json({
          success: false,
          error: 'Preferência não encontrada',
          details: 'Este pode ser um pagamento PIX direto, não uma preferência'
        }, { status: 404 });
      }

      return NextResponse.json(
        { 
          error: `Erro ao buscar preferência: ${preferenceError.message}`,
          details: 'Verifique se o ID é válido'
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('❌ Erro geral:', error);
    
    return NextResponse.json(
      { 
        error: `Erro interno: ${error.message}`,
        details: 'Erro inesperado no servidor'
      },
      { status: 500 }
    );
  }
} 