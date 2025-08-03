import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || ''
});

export async function GET(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    const { paymentId } = params;

    console.log('🔍 Verificando status do pagamento:', { paymentId });

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

    console.log('✅ Credenciais configuradas, verificando pagamento...');

    // Primeiro, tentar buscar como pagamento direto (PIX)
    try {
      const payment = new Payment(client);
      const paymentResult = await payment.get({ id: paymentId });
      
      console.log('✅ Pagamento encontrado:', {
        id: paymentResult.id,
        status: paymentResult.status,
        payment_method_id: paymentResult.payment_method_id
      });

      return NextResponse.json({
        success: true,
        type: 'payment',
        id: paymentResult.id,
        status: paymentResult.status,
        payment_method_id: paymentResult.payment_method_id,
        transaction_amount: paymentResult.transaction_amount,
        external_reference: paymentResult.external_reference,
        // Dados do QR code PIX
        pixQrCode: paymentResult.point_of_interaction?.transaction_data?.qr_code,
        pixQrCodeBase64: paymentResult.point_of_interaction?.transaction_data?.qr_code_base64
      });

    } catch (paymentError: any) {
      console.log('⚠️ Não é um pagamento direto, tentando como preferência...');
      
      // Se não for um pagamento direto, tentar como preferência
      try {
        const preference = new Preference(client);
        const preferenceResult = await preference.get({ preferenceId: paymentId });
        
        console.log('✅ Preferência encontrada:', preferenceResult.id);

        return NextResponse.json({
          success: true,
          type: 'preference',
          id: preferenceResult.id,
          initPoint: preferenceResult.init_point,
          sandboxInitPoint: preferenceResult.sandbox_init_point
        });

      } catch (preferenceError: any) {
        console.error('❌ Erro ao buscar preferência:', preferenceError);
        
        return NextResponse.json({
          success: false,
          error: 'Pagamento não encontrado',
          details: 'O ID fornecido não corresponde a um pagamento ou preferência válida'
        }, { status: 404 });
      }
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