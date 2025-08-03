import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { testEmail } = await request.json();

    if (!testEmail) {
      return NextResponse.json(
        { error: 'Email de teste é obrigatório' },
        { status: 400 }
      );
    }

    console.log('🧪 Testando envio de email para:', testEmail);

    // Gerar código de teste
    const testCode = '123456';
    
    // Criar conteúdo do email de teste
    const emailSubject = '🧪 TESTE - Código de Verificação - FlashConCards';
    
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TESTE - Código de Verificação</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .verification-code { background: white; padding: 30px; margin: 20px 0; border-radius: 8px; border: 2px solid #e5e7eb; text-align: center; }
          .code { font-size: 32px; font-weight: bold; color: #dc2626; letter-spacing: 4px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .test-info { background: #dbeafe; border: 1px solid #3b82f6; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🧪 TESTE - FlashConCards</h1>
            <p>Verificação de Email (TESTE)</p>
          </div>
          
          <div class="content">
            <div class="test-info">
              <strong>🧪 ESTE É UM EMAIL DE TESTE</strong><br>
              Este email foi enviado para testar o sistema de verificação por email.
            </div>
            
            <p>Olá Teste,</p>
            
            <p>Você está testando o sistema de registro da FlashConCards. Para continuar, use o código de verificação abaixo:</p>
            
            <div class="verification-code">
              <h2>Seu Código de Verificação (TESTE)</h2>
              <div class="code">${testCode}</div>
              <p>Digite este código na tela de registro para continuar.</p>
            </div>
            
            <div class="warning">
              <strong>⚠️ Informações do Teste:</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Este é um email de teste</li>
                <li>Código fixo: 123456</li>
                <li>Email de destino: ${testEmail}</li>
                <li>Data/Hora: ${new Date().toLocaleString('pt-BR')}</li>
              </ul>
            </div>
            
            <p>Se você não solicitou este teste, pode ignorar este email com segurança.</p>
          </div>
          
          <div class="footer">
            <p>FlashConCards - Plataforma de Estudos (TESTE)</p>
            <p>Este é um email de teste automático.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailText = `
      🧪 TESTE - FlashConCards - Código de Verificação
      
      Olá Teste,
      
      Você está testando o sistema de registro da FlashConCards. Para continuar, use o código de verificação abaixo:
      
      SEU CÓDIGO DE VERIFICAÇÃO (TESTE): ${testCode}
      
      Digite este código na tela de registro para continuar.
      
      ⚠️ INFORMAÇÕES DO TESTE:
      - Este é um email de teste
      - Código fixo: 123456
      - Email de destino: ${testEmail}
      - Data/Hora: ${new Date().toLocaleString('pt-BR')}
      
      Se você não solicitou este teste, pode ignorar este email com segurança.
      
      FlashConCards - Plataforma de Estudos (TESTE)
    `;

    // Enviar email de teste
    await sendEmail({
      to: testEmail,
      subject: emailSubject,
      html: emailHtml,
      text: emailText
    });

    console.log('✅ Email de teste enviado com sucesso para:', testEmail);

    return NextResponse.json({
      success: true,
      message: 'Email de teste enviado com sucesso',
      testEmail: testEmail,
      testCode: testCode,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Erro ao enviar email de teste:', error);
    return NextResponse.json(
      { error: `Erro ao enviar email de teste: ${error.message}` },
      { status: 500 }
    );
  }
} 