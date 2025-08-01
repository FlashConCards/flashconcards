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
    const { type, to, subject, userName, courseName, expiryText, appUrl, userEmail, userPassword } = data;

    // Validar dados obrigatórios
    if (!to || !subject || !userName || !courseName) {
      return ContentService.createTextOutput(JSON.stringify({
        error: 'Dados obrigatórios faltando'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Criar conteúdo do email baseado no tipo
    let htmlContent;
    if (type === 'admin') {
      htmlContent = createAdminEmailHTML(userName, courseName, appUrl, userEmail, userPassword);
    } else {
      htmlContent = createWelcomeEmailHTML(userName, courseName, expiryText, appUrl, userEmail, userPassword);
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

function createWelcomeEmailHTML(userName, courseName, expiryText, appUrl, userEmail, userPassword) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bem-vindo ao FlashConCards!</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          background-color: #f8f9fa;
        }
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center;
        }
        .header h1 { 
          font-size: 28px; 
          margin-bottom: 10px; 
          font-weight: 700;
        }
        .header h2 { 
          font-size: 18px; 
          opacity: 0.9; 
          font-weight: 400;
        }
        .content { 
          padding: 40px 30px; 
          background: #ffffff;
        }
        .welcome-message {
          font-size: 18px;
          margin-bottom: 30px;
          color: #2d3748;
        }
        .course-highlight { 
          background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
          padding: 25px; 
          border-radius: 12px; 
          border-left: 5px solid #f39c12; 
          margin: 25px 0; 
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .course-highlight h3 { 
          color: #d68910; 
          margin-bottom: 10px; 
          font-size: 20px;
        }
        .login-info {
          background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
          padding: 25px;
          border-radius: 12px;
          margin: 25px 0;
          border-left: 5px solid #28a745;
        }
        .login-info h3 {
          color: #155724;
          margin-bottom: 15px;
          font-size: 18px;
        }
        .credentials {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          margin: 15px 0;
          border: 2px dashed #28a745;
        }
        .credentials strong {
          color: #155724;
        }
        .features-section {
          margin: 30px 0;
        }
        .features-section h3 {
          color: #2d3748;
          margin-bottom: 15px;
          font-size: 18px;
        }
        .features-list {
          list-style: none;
          padding: 0;
        }
        .features-list li {
          padding: 8px 0;
          color: #4a5568;
          position: relative;
          padding-left: 25px;
        }
        .features-list li:before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #38a169;
          font-weight: bold;
        }
        .tips-section {
          background: #f7fafc;
          padding: 25px;
          border-radius: 12px;
          margin: 25px 0;
          border-left: 5px solid #4299e1;
        }
        .tips-section h3 {
          color: #2b6cb0;
          margin-bottom: 15px;
          font-size: 18px;
        }
        .tips-list {
          list-style: none;
          padding: 0;
        }
        .tips-list li {
          padding: 6px 0;
          color: #4a5568;
          position: relative;
          padding-left: 25px;
        }
        .tips-list li:before {
          content: "💡";
          position: absolute;
          left: 0;
        }
        .cta-button { 
          display: inline-block; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          padding: 16px 32px; 
          text-decoration: none; 
          border-radius: 8px; 
          margin: 25px 0; 
          font-weight: 600;
          font-size: 16px;
          text-align: center;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }
        .bonus-section {
          background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%);
          padding: 25px;
          border-radius: 12px;
          margin: 25px 0;
          border-left: 5px solid #e53e3e;
        }
        .bonus-section h4 {
          color: #c53030;
          margin-bottom: 10px;
          font-size: 16px;
        }
        .footer { 
          background: #2d3748; 
          color: #a0aec0; 
          padding: 30px; 
          text-align: center; 
          font-size: 14px;
        }
        .footer p {
          margin: 8px 0;
        }
        .footer .contact {
          color: #4299e1;
          font-weight: 600;
        }
        @media (max-width: 600px) {
          .email-container { margin: 10px; }
          .header, .content, .footer { padding: 20px; }
          .header h1 { font-size: 24px; }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>🎓 FlashConCards</h1>
          <h2>Parabéns pela sua escolha!</h2>
        </div>
        
        <div class="content">
          <div class="welcome-message">
            <p>Olá <strong>${userName}</strong>! 👋</p>
            <p>Estamos muito felizes em ter você conosco! Você acaba de dar um passo importante para alavancar seus estudos e alcançar seus objetivos.</p>
          </div>
          
          <div class="course-highlight">
            <h3>🎯 ${courseName}</h3>
            <p><strong>✨ ${expiryText}</strong></p>
          </div>
          
          <div class="login-info">
            <h3>🔐 Suas Credenciais de Acesso:</h3>
            <div class="credentials">
              <p><strong>📧 Email:</strong> ${userEmail || 'Seu email'}</p>
              <p><strong>🔑 Senha:</strong> ${userPassword || '123456'}</p>
              <p><strong>🌐 Acesse:</strong> <a href="${appUrl}/login" style="color: #28a745;">${appUrl}/login</a></p>
            </div>
          </div>
          
          <div class="features-section">
            <h3>🚀 O que você tem acesso agora:</h3>
            <ul class="features-list">
              <li>📚 Flashcards interativos e personalizados</li>
              <li>📊 Estatísticas detalhadas do seu progresso</li>
              <li>🎯 Conteúdo de aprofundamento</li>
              <li>⏰ Estudo flexível no seu ritmo</li>
              <li>📱 Acesso em qualquer dispositivo</li>
              <li>🎨 Interface moderna e intuitiva</li>
              <li>📈 Relatórios de desempenho</li>
              <li>🎮 Animações interativas</li>
            </ul>
          </div>
          
          <div class="tips-section">
            <h3>💡 Como começar a estudar:</h3>
            <ul class="tips-list">
              <li>Faça login com suas credenciais acima</li>
              <li>Explore a área de estudos</li>
              <li>Comece pelos subtópicos que você tem mais dificuldade</li>
              <li>Use o sistema de aprofundamento para consolidar o conhecimento</li>
              <li>Acompanhe suas estatísticas para identificar pontos de melhoria</li>
              <li>Estude regularmente para manter o conteúdo fresco na memória</li>
              <li>Configure lembretes para manter a consistência</li>
            </ul>
          </div>
          
          <div style="text-align: center;">
            <a href="${appUrl}/login" class="cta-button">
              🚀 Acessar Minha Área de Estudos
            </a>
          </div>
          
          <div class="bonus-section">
            <h4>🎁 Bônus Especial:</h4>
            <p>Como você é um dos nossos primeiros alunos, você tem acesso completo a todas as funcionalidades premium, incluindo animações interativas e conteúdo exclusivo!</p>
          </div>
        </div>
        
        <div class="footer">
          <p>Se você tiver alguma dúvida, não hesite em nos contatar!</p>
          <p class="contact">📧 suporte@flashconcards.com</p>
          <p>💬 Estamos aqui para ajudar você a alcançar seus objetivos!</p>
          <br>
          <p><small>Este email foi enviado automaticamente. Não responda a este email.</small></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function createAdminEmailHTML(userName, courseName, appUrl, userEmail, userPassword) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Acesso Liberado - FlashConCards!</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          background-color: #f8f9fa;
        }
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center;
        }
        .header h1 { 
          font-size: 28px; 
          margin-bottom: 10px; 
          font-weight: 700;
        }
        .header h2 { 
          font-size: 18px; 
          opacity: 0.9; 
          font-weight: 400;
        }
        .content { 
          padding: 40px 30px; 
          background: #ffffff;
        }
        .welcome-message {
          font-size: 18px;
          margin-bottom: 30px;
          color: #2d3748;
        }
        .course-highlight { 
          background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
          padding: 25px; 
          border-radius: 12px; 
          border-left: 5px solid #28a745; 
          margin: 25px 0; 
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .course-highlight h3 { 
          color: #155724; 
          margin-bottom: 10px; 
          font-size: 20px;
        }
        .login-info {
          background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
          padding: 25px;
          border-radius: 12px;
          margin: 25px 0;
          border-left: 5px solid #28a745;
        }
        .login-info h3 {
          color: #155724;
          margin-bottom: 15px;
          font-size: 18px;
        }
        .credentials {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          margin: 15px 0;
          border: 2px dashed #28a745;
        }
        .credentials strong {
          color: #155724;
        }
        .features-section {
          margin: 30px 0;
        }
        .features-section h3 {
          color: #2d3748;
          margin-bottom: 15px;
          font-size: 18px;
        }
        .features-list {
          list-style: none;
          padding: 0;
        }
        .features-list li {
          padding: 8px 0;
          color: #4a5568;
          position: relative;
          padding-left: 25px;
        }
        .features-list li:before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #28a745;
          font-weight: bold;
        }
        .steps-section {
          background: #f7fafc;
          padding: 25px;
          border-radius: 12px;
          margin: 25px 0;
          border-left: 5px solid #4299e1;
        }
        .steps-section h3 {
          color: #2b6cb0;
          margin-bottom: 15px;
          font-size: 18px;
        }
        .steps-list {
          list-style: none;
          padding: 0;
        }
        .steps-list li {
          padding: 8px 0;
          color: #4a5568;
          position: relative;
          padding-left: 30px;
        }
        .steps-list li:before {
          content: counter(step-counter);
          counter-increment: step-counter;
          position: absolute;
          left: 0;
          background: #4299e1;
          color: white;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
        }
        .steps-list {
          counter-reset: step-counter;
        }
        .cta-button { 
          display: inline-block; 
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
          color: white; 
          padding: 16px 32px; 
          text-decoration: none; 
          border-radius: 8px; 
          margin: 25px 0; 
          font-weight: 600;
          font-size: 16px;
          text-align: center;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }
        .bonus-section {
          background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
          padding: 25px;
          border-radius: 12px;
          margin: 25px 0;
          border-left: 5px solid #28a745;
        }
        .bonus-section h4 {
          color: #155724;
          margin-bottom: 10px;
          font-size: 16px;
        }
        .footer { 
          background: #2d3748; 
          color: #a0aec0; 
          padding: 30px; 
          text-align: center; 
          font-size: 14px;
        }
        .footer p {
          margin: 8px 0;
        }
        .footer .contact {
          color: #4299e1;
          font-weight: 600;
        }
        @media (max-width: 600px) {
          .email-container { margin: 10px; }
          .header, .content, .footer { padding: 20px; }
          .header h1 { font-size: 24px; }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>🎓 FlashConCards</h1>
          <h2>Acesso Liberado com Sucesso!</h2>
        </div>
        
        <div class="content">
          <div class="welcome-message">
            <p>Olá <strong>${userName}</strong>! 👋</p>
            <p>Ótimas notícias! Seu acesso ao curso foi liberado pelo administrador e você já pode começar a estudar!</p>
          </div>
          
          <div class="course-highlight">
            <h3>🎯 ${courseName}</h3>
            <p><strong>✅ Seu acesso está ativo e pronto para uso!</strong></p>
          </div>
          
          <div class="login-info">
            <h3>🔐 Suas Credenciais de Acesso:</h3>
            <div class="credentials">
              <p><strong>📧 Email:</strong> ${userEmail || 'Seu email'}</p>
              <p><strong>🔑 Senha:</strong> ${userPassword || '123456'}</p>
              <p><strong>🌐 Acesse:</strong> <a href="${appUrl}/login" style="color: #28a745;">${appUrl}/login</a></p>
            </div>
          </div>
          
          <div class="features-section">
            <h3>🚀 O que você tem acesso agora:</h3>
            <ul class="features-list">
              <li>📚 Flashcards interativos e personalizados</li>
              <li>📊 Estatísticas detalhadas do seu progresso</li>
              <li>🎯 Conteúdo de aprofundamento</li>
              <li>⏰ Estudo flexível no seu ritmo</li>
              <li>📱 Acesso em qualquer dispositivo</li>
              <li>🎨 Interface moderna e intuitiva</li>
              <li>📈 Relatórios de desempenho</li>
              <li>🎮 Animações interativas</li>
            </ul>
          </div>
          
          <div class="steps-section">
            <h3>💡 Como começar:</h3>
            <ul class="steps-list">
              <li>Faça login com suas credenciais acima</li>
              <li>Explore a área de estudos</li>
              <li>Escolha a matéria que deseja estudar</li>
              <li>Navegue pelos tópicos e subtópicos</li>
              <li>Comece com os flashcards</li>
              <li>Use o aprofundamento para consolidar o conhecimento</li>
            </ul>
          </div>
          
          <div style="text-align: center;">
            <a href="${appUrl}/login" class="cta-button">
              🚀 Acessar Minha Área de Estudos
            </a>
          </div>
          
          <div class="bonus-section">
            <h4>🎁 Bônus:</h4>
            <p>Como você foi adicionado pelo administrador, você tem acesso completo a todas as funcionalidades, incluindo animações interativas e conteúdo exclusivo!</p>
          </div>
        </div>
        
        <div class="footer">
          <p>Se você tiver alguma dúvida, não hesite em nos contatar!</p>
          <p class="contact">📧 suporte@flashconcards.com</p>
          <p>💬 Estamos aqui para ajudar você a alcançar seus objetivos!</p>
          <br>
          <p><small>Este email foi enviado automaticamente. Não responda a este email.</small></p>
        </div>
      </div>
    </body>
    </html>
  `;
} 