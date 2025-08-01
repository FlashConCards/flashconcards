import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface WelcomeEmailData {
  userName: string;
  userEmail: string;
  courseName: string;
  accessExpiryDate?: string;
}

export const sendWelcomeEmail = async (data: WelcomeEmailData) => {
  try {
    const { userName, userEmail, courseName, accessExpiryDate } = data;
    
    const expiryText = accessExpiryDate 
      ? `Seu acesso estará disponível até ${accessExpiryDate}.`
      : 'Seu acesso não tem data de expiração.';

    const result = await resend.emails.send({
      from: 'FlashConCards <noreply@flashconcards.com>',
      to: [userEmail],
      subject: `🎉 Bem-vindo ao ${courseName}! Sua jornada de estudos começa agora!`,
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bem-vindo ao FlashConCards!</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8fafc;
            }
            .container {
              background-color: white;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #3b82f6;
              margin-bottom: 10px;
            }
            .welcome-title {
              font-size: 24px;
              color: #1f2937;
              margin-bottom: 20px;
            }
            .course-name {
              background: linear-gradient(135deg, #3b82f6, #8b5cf6);
              color: white;
              padding: 12px 24px;
              border-radius: 8px;
              display: inline-block;
              margin: 20px 0;
              font-weight: bold;
            }
            .content {
              margin: 30px 0;
            }
            .feature {
              display: flex;
              align-items: center;
              margin: 15px 0;
              padding: 15px;
              background-color: #f8fafc;
              border-radius: 8px;
              border-left: 4px solid #3b82f6;
            }
            .feature-icon {
              font-size: 20px;
              margin-right: 15px;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #3b82f6, #8b5cf6);
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              margin: 20px 0;
              text-align: center;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 14px;
            }
            .highlight {
              background-color: #fef3c7;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #f59e0b;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🎓 FlashConCards</div>
              <h1 class="welcome-title">Parabéns pela sua escolha!</h1>
            </div>

            <div class="content">
              <p>Olá <strong>${userName}</strong>! 👋</p>
              
              <p>Estamos muito felizes em ter você conosco! Você acaba de dar um passo importante para alavancar seus estudos e alcançar seus objetivos.</p>

              <div class="course-name">
                🎯 ${courseName}
              </div>

              <div class="highlight">
                <strong>✨ ${expiryText}</strong>
              </div>

              <h3>🚀 O que você tem acesso agora:</h3>
              
              <div class="feature">
                <span class="feature-icon">📚</span>
                <div>
                  <strong>Flashcards Interativos</strong><br>
                  Estude de forma eficiente com nossos flashcards personalizados
                </div>
              </div>

              <div class="feature">
                <span class="feature-icon">📊</span>
                <div>
                  <strong>Estatísticas Detalhadas</strong><br>
                  Acompanhe seu progresso e melhore sua performance
                </div>
              </div>

              <div class="feature">
                <span class="feature-icon">🎯</span>
                <div>
                  <strong>Aprofundamento</strong><br>
                  Conteúdo extra para consolidar seu conhecimento
                </div>
              </div>

              <div class="feature">
                <span class="feature-icon">⏰</span>
                <div>
                  <strong>Estudo Flexível</strong><br>
                  Estude no seu ritmo, quando e onde quiser
                </div>
              </div>

              <h3>💡 Dicas para começar:</h3>
              <ul>
                <li>Comece pelos subtópicos que você tem mais dificuldade</li>
                <li>Use o sistema de aprofundamento para consolidar o conhecimento</li>
                <li>Acompanhe suas estatísticas para identificar pontos de melhoria</li>
                <li>Estude regularmente para manter o conteúdo fresco na memória</li>
              </ul>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://flashconcards.vercel.app'}/dashboard" class="cta-button">
                  🚀 Começar a Estudar Agora!
                </a>
              </div>

              <div class="highlight">
                <strong>🎁 Bônus Especial:</strong><br>
                Como você é um dos nossos primeiros alunos, você tem acesso completo a todas as funcionalidades premium!
              </div>
            </div>

            <div class="footer">
              <p>Se você tiver alguma dúvida, não hesite em nos contatar!</p>
              <p>📧 suporte@flashconcards.com</p>
              <p>💬 Estamos aqui para ajudar você a alcançar seus objetivos!</p>
              <br>
              <p><small>Este email foi enviado automaticamente. Não responda a este email.</small></p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log('Welcome email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

export const sendAdminWelcomeEmail = async (data: WelcomeEmailData) => {
  try {
    const { userName, userEmail, courseName } = data;
    
    const result = await resend.emails.send({
      from: 'FlashConCards <noreply@flashconcards.com>',
      to: [userEmail],
      subject: `🎉 Acesso Liberado! Bem-vindo ao ${courseName}!`,
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Acesso Liberado - FlashConCards!</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8fafc;
            }
            .container {
              background-color: white;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #3b82f6;
              margin-bottom: 10px;
            }
            .welcome-title {
              font-size: 24px;
              color: #1f2937;
              margin-bottom: 20px;
            }
            .course-name {
              background: linear-gradient(135deg, #10b981, #059669);
              color: white;
              padding: 12px 24px;
              border-radius: 8px;
              display: inline-block;
              margin: 20px 0;
              font-weight: bold;
            }
            .content {
              margin: 30px 0;
            }
            .highlight {
              background-color: #d1fae5;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #10b981;
              margin: 20px 0;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #10b981, #059669);
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              margin: 20px 0;
              text-align: center;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🎓 FlashConCards</div>
              <h1 class="welcome-title">Acesso Liberado com Sucesso!</h1>
            </div>

            <div class="content">
              <p>Olá <strong>${userName}</strong>! 👋</p>
              
              <p>Ótimas notícias! Seu acesso ao curso foi liberado pelo administrador e você já pode começar a estudar!</p>

              <div class="course-name">
                🎯 ${courseName}
              </div>

              <div class="highlight">
                <strong>✅ Seu acesso está ativo e pronto para uso!</strong><br>
                Você pode começar a estudar imediatamente.
              </div>

              <h3>🚀 O que você tem acesso agora:</h3>
              
              <ul>
                <li>📚 Flashcards interativos e personalizados</li>
                <li>📊 Estatísticas detalhadas do seu progresso</li>
                <li>🎯 Conteúdo de aprofundamento</li>
                <li>⏰ Estudo flexível no seu ritmo</li>
                <li>📱 Acesso em qualquer dispositivo</li>
              </ul>

              <h3>💡 Como começar:</h3>
              <ol>
                <li>Acesse sua área de estudos</li>
                <li>Escolha a matéria que deseja estudar</li>
                <li>Navegue pelos tópicos e subtópicos</li>
                <li>Comece com os flashcards</li>
                <li>Use o aprofundamento para consolidar o conhecimento</li>
              </ol>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://flashconcards.vercel.app'}/dashboard" class="cta-button">
                  🚀 Acessar Minha Área de Estudos
                </a>
              </div>

              <div class="highlight">
                <strong>🎁 Bônus:</strong><br>
                Como você foi adicionado pelo administrador, você tem acesso completo a todas as funcionalidades!
              </div>
            </div>

            <div class="footer">
              <p>Se você tiver alguma dúvida, não hesite em nos contatar!</p>
              <p>📧 suporte@flashconcards.com</p>
              <p>💬 Estamos aqui para ajudar você a alcançar seus objetivos!</p>
              <br>
              <p><small>Este email foi enviado automaticamente. Não responda a este email.</small></p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log('Admin welcome email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending admin welcome email:', error);
    throw error;
  }
}; 