import { NextRequest, NextResponse } from 'next/server';
import { getPaymentById, createInvoice } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const { paymentId, userId, courseId, courseName, amount } = await request.json();

    if (!paymentId || !userId || !courseId || !courseName || !amount) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      );
    }

    console.log('🔄 Gerando nota fiscal para pagamento:', paymentId);

    // Verificar se o pagamento foi aprovado
    const payment = await getPaymentById(paymentId);
    if (!payment) {
      return NextResponse.json(
        { error: 'Pagamento não encontrado' },
        { status: 404 }
      );
    }

    // Fazer cast para acessar propriedades do pagamento
    const paymentData = payment as any;
    if (paymentData.status !== 'approved') {
      return NextResponse.json(
        { error: 'Pagamento não foi aprovado' },
        { status: 400 }
      );
    }

    // Gerar número da nota fiscal (formato: NF-YYYYMMDD-XXXX)
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const invoiceNumber = `NF-${dateStr}-${randomNum}`;

    // Criar dados da nota fiscal
    const invoiceData = {
      invoiceNumber,
      paymentId,
      userId,
      courseId,
      courseName,
      amount,
      issueDate: new Date(),
      dueDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 dias
      status: 'issued',
      items: [
        {
          description: courseName,
          quantity: 1,
          unitPrice: amount,
          totalPrice: amount
        }
      ],
      totalAmount: amount,
      taxAmount: 0, // Isento de impostos para cursos online
      netAmount: amount
    };

    // Salvar nota fiscal no Firebase
    const invoiceId = await createInvoice(invoiceData);

    console.log('✅ Nota fiscal gerada:', invoiceNumber);

    // Enviar nota fiscal por email
    try {
      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/invoice/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoiceId })
      });

      if (emailResponse.ok) {
        console.log('✅ Email da nota fiscal enviado com sucesso');
      } else {
        console.error('❌ Erro ao enviar email da nota fiscal');
      }
    } catch (error) {
      console.error('❌ Erro ao enviar email da nota fiscal:', error);
    }

    return NextResponse.json({
      success: true,
      invoiceId,
      invoiceNumber,
      message: 'Nota fiscal gerada e enviada por email com sucesso'
    });

  } catch (error: any) {
    console.error('❌ Erro ao gerar nota fiscal:', error);
    return NextResponse.json(
      { error: `Erro ao gerar nota fiscal: ${error.message}` },
      { status: 500 }
    );
  }
} 