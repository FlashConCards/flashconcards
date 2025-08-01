/**
 * Google Apps Script para enviar emails via Gmail
 * 
 * INSTRUÇÕES:
 * 1. Acesse: https://script.google.com/
 * 2. Clique em "Novo projeto"
 * 3. Cole este código
 * 4. Salve o projeto
 * 5. Clique em "Deploy" > "New deployment"
 * 6. Escolha "Web app"
 * 7. Configure:
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 8. Clique em "Deploy"
 * 9. Copie a URL gerada
 * 10. Adicione como GOOGLE_APPS_SCRIPT_URL no Vercel
 */

function doPost(e) {
  try {
    // Verificar se recebeu dados
    if (!e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({
        error: 'Nenhum dado recebido'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Parsear dados recebidos
    const data = JSON.parse(e.postData.contents);
    const { type, to, subject, userName, courseName, expiryText, appUrl } = data;

    // Validar dados obrigatórios
    if (!to || !subject || !userName || !courseName) {
      return ContentService.createTextOutput(JSON.stringify({
        error: 'Dados obrigatórios faltando'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Criar conteúdo do email baseado no tipo
    let htmlContent;
    if (type === 'admin') {
      htmlContent = createAdminEmailHTML(userName, courseName, appUrl);
    } else {
      htmlContent = createWelcomeEmailHTML(userName, courseName, expiryText, appUrl);
    }

    // Enviar email
    GmailApp.sendEmail(to, subject, '', {
      htmlBody: htmlContent,
      name: 'FlashConCards',
      replyTo: 'suporte@flashconcards.com'
    });

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Email enviado com sucesso',
      to: to,
      subject: subject
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      error: 'Erro ao processar requisição',
      details: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function createWelcomeEmailHTML(userName, courseName, expiryText, appUrl) {
  return `
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
            <a href="${appUrl}/dashboard" class="button">
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
}

function createAdminEmailHTML(userName, courseName, appUrl) {
  return `
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
            <a href="${appUrl}/dashboard" class="button">
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
} 