import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { getUserPayments } from '@/lib/firebase';

// Configurar Mercado Pago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '' 
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const paymentId = searchParams.get('paymentId');

    if (!userId && !paymentId) {
      return NextResponse.json(
        { error: 'userId ou paymentId é obrigatório' },
        { status: 400 }
      );
    }

    let paymentToCheck = null;

    if (paymentId) {
      // Verificar pagamento específico
      paymentToCheck = { paymentId };
    } else {
      // Buscar pagamentos do usuário
      const userPayments = await getUserPayments(userId!);
      const pendingPayment = userPayments.find(p => p.status === 'pending');
      
      if (pendingPayment) {
        paymentToCheck = { paymentId: pendingPayment.paymentId };
      }
    }

    if (!paymentToCheck) {
      return NextResponse.json(
        { success: false, message: 'Nenhum pagamento pendente encontrado' }
      );
    }

    console.log('🔍 Verificando status do pagamento:', paymentToCheck.paymentId);

    // Buscar informações do pagamento no Mercado Pago
    const payment = new Payment(client);
    const paymentInfo = await payment.get({ id: paymentToCheck.paymentId });

    console.log('📊 Status do pagamento:', paymentInfo.status);

    return NextResponse.json({
      success: true,
      payment: {
        id: paymentInfo.id,
        status: paymentInfo.status,
        payment_method_id: paymentInfo.payment_method_id,
        external_reference: paymentInfo.external_reference,
        transaction_amount: paymentInfo.transaction_amount,
        date_created: paymentInfo.date_created,
        date_approved: paymentInfo.date_approved
      }
    });

  } catch (error: any) {
    console.error('❌ Erro ao verificar status do pagamento:', error);
    return NextResponse.json(
      { error: `Erro ao verificar status: ${error.message}` },
      { status: 500 }
    );
  }
} 