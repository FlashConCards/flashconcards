import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

// Declaração de tipo para a variável global
declare global {
  var verificationCodes: Map<string, { code: string; timestamp: number; displayName: string }>;
}

export async function POST(request: NextRequest) {
  try {
    const { email, displayName } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    // Gerar código de verificação (6 dígitos)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Salvar código temporariamente (em produção, usar Redis ou similar)
    // Por enquanto, vamos usar uma variável global simples
    if (!global.verificationCodes) {
      global.verificationCodes = new Map();
    }
    
    // Salvar código com timestamp (expira em 10 minutos)
    global.verificationCodes.set(email, {
      code: verificationCode,
      timestamp: Date.now(),
      displayName: displayName || ''
    });

    console.log('📧 Enviando código de verificação para:', email);

    // Criar conteúdo do email
    const emailSubject = 'Código de Verificação - FlashConCards';
    
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Código de Verificação</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .verification-code { background: white; padding: 30px; margin: 20px 0; border-radius: 8px; border: 2px solid #e5e7eb; text-align: center; }
          .code { font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 4px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>FlashConCards</h1>
            <p>Verificação de Email</p>
          </div>
          
          <div class="content">
            <p>Olá${displayName ? ` ${displayName}` : ''},</p>
            
            <p>Você está se registrando na FlashConCards. Para continuar, use o código de verificação abaixo:</p>
            
            <div class="verification-code">
              <h2>Seu Código de Verificação</h2>
              <div class="code">${verificationCode}</div>
              <p>Digite este código na tela de registro para continuar.</p>
            </div>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Este código expira em 10 minutos</li>
                <li>Não compartilhe este código com ninguém</li>
                <li>Se você não solicitou este código, ignore este email</li>
              </ul>
            </div>
            
            <p>Se você não solicitou este código, pode ignorar este email com segurança.</p>
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
      FlashConCards - Código de Verificação
      
      Olá${displayName ? ` ${displayName}` : ''},
      
      Você está se registrando na FlashConCards. Para continuar, use o código de verificação abaixo:
      
      SEU CÓDIGO DE VERIFICAÇÃO: ${verificationCode}
      
      Digite este código na tela de registro para continuar.
      
      ⚠️ IMPORTANTE:
      - Este código expira em 10 minutos
      - Não compartilhe este código com ninguém
      - Se você não solicitou este código, ignore este email
      
      Se você não solicitou este código, pode ignorar este email com segurança.
      
      FlashConCards - Plataforma de Estudos
    `;

    // Enviar email
    await sendEmail({
      to: email,
      subject: emailSubject,
      html: emailHtml,
      text: emailText
    });

    console.log('✅ Código de verificação enviado para:', email);

    return NextResponse.json({
      success: true,
      message: 'Código de verificação enviado com sucesso'
    });

  } catch (error: any) {
    console.error('❌ Erro ao enviar código de verificação:', error);
    return NextResponse.json(
      { error: `Erro ao enviar código de verificação: ${error.message}` },
      { status: 500 }
    );
  }
} 