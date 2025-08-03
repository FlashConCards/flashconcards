import { NextRequest, NextResponse } from 'next/server';
import { getInvoiceById, getUserData } from '@/lib/firebase';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { invoiceId } = await request.json();

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'ID da nota fiscal não fornecido' },
        { status: 400 }
      );
    }

    console.log('📧 Enviando nota fiscal por email:', invoiceId);

    // Buscar dados da nota fiscal
    const invoice = await getInvoiceById(invoiceId);
    if (!invoice) {
      return NextResponse.json(
        { error: 'Nota fiscal não encontrada' },
        { status: 404 }
      );
    }

    // Buscar dados do usuário
    const userData = await getUserData(invoice.userId);
    if (!userData) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Formatar dados para o email
    const formatDate = (date: any) => {
      if (!date) return '';
      const d = date.toDate ? date.toDate() : new Date(date);
      return d.toLocaleDateString('pt-BR');
    };

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    };

    // Criar conteúdo do email
    const emailSubject = `Nota Fiscal ${invoice.invoiceNumber} - FlashConCards`;
    
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nota Fiscal ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .invoice-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #e5e7eb; }
          .invoice-number { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
          .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
          .total { font-weight: bold; font-size: 18px; margin-top: 20px; padding-top: 20px; border-top: 2px solid #e5e7eb; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .btn { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>FlashConCards</h1>
            <p>Nota Fiscal</p>
          </div>
          
          <div class="content">
            <p>Olá ${userData.displayName || userData.email},</p>
            
            <p>Sua nota fiscal foi gerada com sucesso! Abaixo estão os detalhes:</p>
            
            <div class="invoice-details">
              <div class="invoice-number">${invoice.invoiceNumber}</div>
              
              <div style="margin-bottom: 20px;">
                <strong>Data de Emissão:</strong> ${formatDate(invoice.issueDate)}<br>
                <strong>Vencimento:</strong> ${formatDate(invoice.dueDate)}<br>
                <strong>Status:</strong> <span style="color: #059669; font-weight: bold;">Emitida</span>
              </div>
              
              <div style="margin-bottom: 20px;">
                <strong>Dados do Cliente:</strong><br>
                Nome: ${userData.displayName || 'N/A'}<br>
                Email: ${userData.email}<br>
                CPF/CNPJ: ${userData.cpf || userData.cnpj || 'N/A'}
              </div>
              
              <div style="margin-bottom: 20px;">
                <strong>Itens:</strong>
                ${invoice.items.map((item: any) => `
                  <div class="item">
                    <span>${item.description}</span>
                    <span>${formatCurrency(item.totalPrice)}</span>
                  </div>
                `).join('')}
              </div>
              
              <div class="total">
                <div class="item">
                  <span>Subtotal:</span>
                  <span>${formatCurrency(invoice.totalAmount)}</span>
                </div>
                <div class="item">
                  <span>Impostos:</span>
                  <span>${formatCurrency(invoice.taxAmount)}</span>
                </div>
                <div class="item">
                  <span><strong>Total:</strong></span>
                  <span><strong>${formatCurrency(invoice.netAmount)}</strong></span>
                </div>
              </div>
            </div>
            
            <p style="margin-top: 20px;">
              <strong>Informações Importantes:</strong>
            </p>
            <ul style="margin-left: 20px;">
              <li>Esta nota fiscal é isenta de impostos conforme art. 150, VI, "d" da CF/88</li>
              <li>O acesso ao curso está ativo imediatamente após a aprovação do pagamento</li>
              <li>Em caso de dúvidas, entre em contato conosco</li>
            </ul>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://flashconcards.com'}/dashboard" class="btn">
                Acessar Dashboard
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>FlashConCards - Plataforma de Estudos</p>
            <p>Este é um email automático, não responda a esta mensagem.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailText = `
      FlashConCards - Nota Fiscal ${invoice.invoiceNumber}
      
      Olá ${userData.displayName || userData.email},
      
      Sua nota fiscal foi gerada com sucesso!
      
      DETALHES DA NOTA FISCAL:
      Número: ${invoice.invoiceNumber}
      Data de Emissão: ${formatDate(invoice.issueDate)}
      Vencimento: ${formatDate(invoice.dueDate)}
      Status: Emitida
      
      ITENS:
      ${invoice.items.map((item: any) => `${item.description} - ${formatCurrency(item.totalPrice)}`).join('\n')}
      
      TOTAL: ${formatCurrency(invoice.netAmount)}
      
      Informações Importantes:
      - Esta nota fiscal é isenta de impostos conforme art. 150, VI, "d" da CF/88
      - O acesso ao curso está ativo imediatamente após a aprovação do pagamento
      - Em caso de dúvidas, entre em contato conosco
      
      Acesse seu dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'https://flashconcards.com'}/dashboard
      
      FlashConCards - Plataforma de Estudos
    `;

    // Enviar email
    await sendEmail({
      to: userData.email,
      subject: emailSubject,
      html: emailHtml,
      text: emailText
    });

    console.log('✅ Email da nota fiscal enviado para:', userData.email);

    return NextResponse.json({
      success: true,
      message: 'Nota fiscal enviada por email com sucesso'
    });

  } catch (error: any) {
    console.error('❌ Erro ao enviar nota fiscal por email:', error);
    return NextResponse.json(
      { error: `Erro ao enviar nota fiscal: ${error.message}` },
      { status: 500 }
    );
  }
} 