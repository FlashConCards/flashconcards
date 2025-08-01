import * as SibApiV3Sdk from '@getbrevo/brevo';

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || '');

export interface SimpleEmailData {
  userName: string;
  userEmail: string;
  courseName: string;
  accessExpiryDate?: string;
}

export const sendSimpleWelcomeEmail = async (data: SimpleEmailData) => {
  try {
    const { userName, userEmail, courseName, accessExpiryDate } = data;
    
    const expiryText = accessExpiryDate 
      ? `Seu acesso estará disponível até ${accessExpiryDate}.`
      : 'Seu acesso não tem data de expiração.';

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    
    sendSmtpEmail.subject = `🎉 Parabéns! Bem-vindo ao ${courseName}!`;
    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Bem-vindo ao FlashConCards!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; }
          .content { padding: 20px; background: #f9f9f9; border-radius: 10px; margin: 20px 0; }
          .highlight { background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 15px 0; }
          .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 FlashConCards</h1>
            <h2>Parabéns pela sua escolha!</h2>
          </div>
          
          <div class="content">
            <p>Olá <strong>${userName}</strong>! 👋</p>
            
            <p>Estamos muito felizes em ter você conosco! Você acaba de dar um passo importante para alavancar seus estudos e alcançar seus objetivos.</p>
            
            <div class="highlight">
              <h3>🎯 ${courseName}</h3>
              <p><strong>✨ ${expiryText}</strong></p>
            </div>
            
            <h3>🚀 O que você tem acesso agora:</h3>
            <ul>
              <li>📚 Flashcards interativos e personalizados</li>
              <li>📊 Estatísticas detalhadas do seu progresso</li>
              <li>🎯 Conteúdo de aprofundamento</li>
              <li>⏰ Estudo flexível no seu ritmo</li>
            </ul>
            
            <h3>💡 Dicas para começar:</h3>
            <ul>
              <li>Comece pelos subtópicos que você tem mais dificuldade</li>
              <li>Use o sistema de aprofundamento para consolidar o conhecimento</li>
              <li>Acompanhe suas estatísticas para identificar pontos de melhoria</li>
              <li>Estude regularmente para manter o conteúdo fresco na memória</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://flashconcards.vercel.app'}/dashboard" class="button">
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
    `;
    
    sendSmtpEmail.sender = { name: 'FlashConCards', email: 'noreply@flashconcards.com' };
    sendSmtpEmail.to = [{ email: userEmail, name: userName }];
    
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Simple welcome email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending simple welcome email:', error);
    throw error;
  }
};

export const sendSimpleAdminEmail = async (data: SimpleEmailData) => {
  try {
    const { userName, userEmail, courseName } = data;
    
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    
    sendSmtpEmail.subject = `🎉 Acesso Liberado! Bem-vindo ao ${courseName}!`;
    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Acesso Liberado - FlashConCards!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; border-radius: 10px; }
          .content { padding: 20px; background: #f9f9f9; border-radius: 10px; margin: 20px 0; }
          .highlight { background: #d4edda; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745; margin: 15px 0; }
          .button { display: inline-block; background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 FlashConCards</h1>
            <h2>Acesso Liberado com Sucesso!</h2>
          </div>
          
          <div class="content">
            <p>Olá <strong>${userName}</strong>! 👋</p>
            
            <p>Ótimas notícias! Seu acesso ao curso foi liberado pelo administrador e você já pode começar a estudar!</p>
            
            <div class="highlight">
              <h3>🎯 ${courseName}</h3>
              <p><strong>✅ Seu acesso está ativo e pronto para uso!</strong></p>
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
            
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://flashconcards.vercel.app'}/dashboard" class="button">
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
    `;
    
    sendSmtpEmail.sender = { name: 'FlashConCards', email: 'noreply@flashconcards.com' };
    sendSmtpEmail.to = [{ email: userEmail, name: userName }];
    
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Simple admin email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending simple admin email:', error);
    throw error;
  }
}; 