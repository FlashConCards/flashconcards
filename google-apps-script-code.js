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
          color: #2d3748; 
          background-color: #f7fafc;
          padding: 20px;
        }
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: #ffffff;
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
          font-size: 32px; 
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
          text-align: center;
        }
        .course-highlight { 
          background-color: #fff3cd;
          padding: 25px; 
          border-radius: 8px; 
          margin: 25px 0; 
          border-left: 4px solid #ffc107;
        }
        .course-highlight h3 { 
          color: #856404; 
          margin-bottom: 10px; 
          font-size: 20px;
          font-weight: 700;
        }
        .login-info {
          background-color: #d4edda;
          padding: 25px;
          border-radius: 8px;
          margin: 25px 0;
          border-left: 4px solid #28a745;
        }
        .login-info h3 {
          color: #155724;
          margin-bottom: 15px;
          font-size: 18px;
          font-weight: 700;
        }
        .credentials {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 6px;
          margin: 15px 0;
          border: 2px solid #28a745;
        }
        .credentials strong {
          color: #155724;
          font-weight: 700;
        }
        .features-section {
          margin: 30px 0;
        }
        .features-section h3 {
          color: #2d3748;
          margin-bottom: 15px;
          font-size: 18px;
          font-weight: 700;
          text-align: center;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
          margin-top: 20px;
        }
        .feature-card {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }
        .feature-card h4 {
          color: #495057;
          margin-bottom: 10px;
          font-weight: 600;
        }
        .feature-card p {
          color: #6c757d;
          font-size: 14px;
        }
        .tips-section {
          background-color: #fff3cd;
          padding: 25px;
          border-radius: 8px;
          margin: 25px 0;
          border-left: 4px solid #ffc107;
        }
        .tips-section h3 {
          color: #856404;
          margin-bottom: 15px;
          font-size: 18px;
          font-weight: 700;
        }
        .tips-list {
          list-style: none;
          padding: 0;
        }
        .tips-list li {
          padding: 8px 0;
          color: #856404;
          position: relative;
          padding-left: 25px;
          font-weight: 500;
        }
        .tips-list li:before {
          content: "";
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 8px;
          height: 8px;
          background-color: #ffc107;
          border-radius: 50%;
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
        }
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }
        .bonus-section {
          background-color: #f8d7da;
          padding: 25px;
          border-radius: 8px;
          margin: 25px 0;
          border-left: 4px solid #dc3545;
        }
        .bonus-section h4 {
          color: #721c24;
          margin-bottom: 10px;
          font-size: 16px;
          font-weight: 700;
        }
        .footer { 
          background-color: #343a40; 
          color: #ffffff; 
          padding: 30px; 
          text-align: center; 
          font-size: 14px;
        }
        .footer p {
          margin: 8px 0;
        }
        .footer .contact {
          color: #17a2b8;
          font-weight: 600;
        }
        @media (max-width: 600px) {
          .email-container { margin: 10px; }
          .header, .content, .footer { padding: 20px; }
          .header h1 { font-size: 24px; }
          .features-grid { grid-template-columns: 1fr; }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>FlashConCards</h1>
          <h2>Parabens pela sua escolha!</h2>
        </div>
        
        <div class="content">
          <div class="welcome-message">
            <p>Ola <strong>${userName}</strong>!</p>
            <p>Estamos muito felizes em ter voce conosco! Voce acaba de dar um passo importante para alavancar seus estudos e alcancar seus objetivos.</p>
          </div>
          
          <div class="course-highlight">
            <h3>${courseName}</h3>
            <p><strong>${expiryText}</strong></p>
          </div>
          
          <div class="login-info">
            <h3>Suas Credenciais de Acesso:</h3>
            <div class="credentials">
              <p><strong>Email:</strong> ${userEmail || 'Seu email'}</p>
              <p><strong>Senha:</strong> ${userPassword || '123456'}</p>
              <p><strong>Acesse:</strong> <a href="${appUrl}/login" style="color: #28a745; text-decoration: none; font-weight: 600;">${appUrl}/login</a></p>
            </div>
          </div>
          
          <div class="features-section">
            <h3>O que voce tem acesso agora:</h3>
            <div class="features-grid">
              <div class="feature-card">
                <h4>Flashcards Interativos</h4>
                <p>Estude com flashcards personalizados e inteligentes que se adaptam ao seu progresso.</p>
              </div>
              <div class="feature-card">
                <h4>Estatisticas Detalhadas</h4>
                <p>Acompanhe seu progresso com graficos e relatorios em tempo real.</p>
              </div>
              <div class="feature-card">
                <h4>Conteudo de Aprofundamento</h4>
                <p>Acesse material complementar para consolidar seu conhecimento.</p>
              </div>
              <div class="feature-card">
                <h4>Estudo Flexivel</h4>
                <p>Estude no seu ritmo, quando e onde quiser, em qualquer dispositivo.</p>
              </div>
              <div class="feature-card">
                <h4>Interface Moderna</h4>
                <p>Desfrute de uma interface intuitiva e responsiva para uma experiencia incrivel.</p>
              </div>
              <div class="feature-card">
                <h4>Animações Interativas</h4>
                <p>Engaje-se com animações e elementos visuais que tornam o estudo mais divertido.</p>
              </div>
            </div>
          </div>
          
          <div class="tips-section">
            <h3>Como comecar a estudar:</h3>
            <ul class="tips-list">
              <li>Faca login com suas credenciais acima</li>
              <li>Explore a area de estudos e familiarize-se com a interface</li>
              <li>Comece pelos subtopicos que voce tem mais dificuldade</li>
              <li>Use o sistema de aprofundamento para consolidar o conhecimento</li>
              <li>Acompanhe suas estatisticas para identificar pontos de melhoria</li>
              <li>Estude regularmente para manter o conteudo fresco na memoria</li>
              <li>Configure lembretes para manter a consistencia nos estudos</li>
            </ul>
          </div>
          
          <div style="text-align: center;">
            <a href="${appUrl}/login" class="cta-button">
              Acessar Minha Area de Estudos
            </a>
          </div>
          
          <div class="bonus-section">
            <h4>Bonus Especial:</h4>
            <p>Como voce e um dos nossos primeiros alunos, voce tem acesso completo a todas as funcionalidades premium, incluindo animações interativas e conteudo exclusivo!</p>
          </div>
        </div>
        
        <div class="footer">
          <p>Se voce tiver alguma duvida, nao hesite em nos contatar!</p>
          <p class="contact">suporte@flashconcards.com</p>
          <p>Estamos aqui para ajudar voce a alcancar seus objetivos!</p>
          <br>
          <p><small>Este email foi enviado automaticamente. Nao responda a este email.</small></p>
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
          color: #2d3748; 
          background-color: #f7fafc;
          padding: 20px;
        }
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: #ffffff;
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
          font-size: 32px; 
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
          text-align: center;
        }
        .course-highlight { 
          background-color: #d4edda;
          padding: 25px; 
          border-radius: 8px; 
          margin: 25px 0; 
          border-left: 4px solid #28a745;
        }
        .course-highlight h3 { 
          color: #155724; 
          margin-bottom: 10px; 
          font-size: 20px;
          font-weight: 700;
        }
        .login-info {
          background-color: #d4edda;
          padding: 25px;
          border-radius: 8px;
          margin: 25px 0;
          border-left: 4px solid #28a745;
        }
        .login-info h3 {
          color: #155724;
          margin-bottom: 15px;
          font-size: 18px;
          font-weight: 700;
        }
        .credentials {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 6px;
          margin: 15px 0;
          border: 2px solid #28a745;
        }
        .credentials strong {
          color: #155724;
          font-weight: 700;
        }
        .features-section {
          margin: 30px 0;
        }
        .features-section h3 {
          color: #2d3748;
          margin-bottom: 15px;
          font-size: 18px;
          font-weight: 700;
          text-align: center;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
          margin-top: 20px;
        }
        .feature-card {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }
        .feature-card h4 {
          color: #495057;
          margin-bottom: 10px;
          font-weight: 600;
        }
        .feature-card p {
          color: #6c757d;
          font-size: 14px;
        }
        .steps-section {
          background-color: #fff3cd;
          padding: 25px;
          border-radius: 8px;
          margin: 25px 0;
          border-left: 4px solid #ffc107;
        }
        .steps-section h3 {
          color: #856404;
          margin-bottom: 15px;
          font-size: 18px;
          font-weight: 700;
        }
        .steps-list {
          list-style: none;
          padding: 0;
        }
        .steps-list li {
          padding: 8px 0;
          color: #856404;
          position: relative;
          padding-left: 30px;
          font-weight: 500;
        }
        .steps-list li:before {
          content: counter(step-counter);
          counter-increment: step-counter;
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          background-color: #007bff;
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
        }
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }
        .bonus-section {
          background-color: #d4edda;
          padding: 25px;
          border-radius: 8px;
          margin: 25px 0;
          border-left: 4px solid #28a745;
        }
        .bonus-section h4 {
          color: #155724;
          margin-bottom: 10px;
          font-size: 16px;
          font-weight: 700;
        }
        .footer { 
          background-color: #343a40; 
          color: #ffffff; 
          padding: 30px; 
          text-align: center; 
          font-size: 14px;
        }
        .footer p {
          margin: 8px 0;
        }
        .footer .contact {
          color: #17a2b8;
          font-weight: 600;
        }
        @media (max-width: 600px) {
          .email-container { margin: 10px; }
          .header, .content, .footer { padding: 20px; }
          .header h1 { font-size: 24px; }
          .features-grid { grid-template-columns: 1fr; }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>FlashConCards</h1>
          <h2>Acesso Liberado com Sucesso!</h2>
        </div>
        
        <div class="content">
          <div class="welcome-message">
            <p>Ola <strong>${userName}</strong>!</p>
            <p>Otimas noticias! Seu acesso ao curso foi liberado pelo administrador e voce ja pode comecar a estudar!</p>
          </div>
          
          <div class="course-highlight">
            <h3>${courseName}</h3>
            <p><strong>Seu acesso esta ativo e pronto para uso!</strong></p>
          </div>
          
          <div class="login-info">
            <h3>Suas Credenciais de Acesso:</h3>
            <div class="credentials">
              <p><strong>Email:</strong> ${userEmail || 'Seu email'}</p>
              <p><strong>Senha:</strong> ${userPassword || '123456'}</p>
              <p><strong>Acesse:</strong> <a href="${appUrl}/login" style="color: #28a745; text-decoration: none; font-weight: 600;">${appUrl}/login</a></p>
            </div>
          </div>
          
          <div class="features-section">
            <h3>O que voce tem acesso agora:</h3>
            <div class="features-grid">
              <div class="feature-card">
                <h4>Flashcards Interativos</h4>
                <p>Estude com flashcards personalizados e inteligentes que se adaptam ao seu progresso.</p>
              </div>
              <div class="feature-card">
                <h4>Estatisticas Detalhadas</h4>
                <p>Acompanhe seu progresso com graficos e relatorios em tempo real.</p>
              </div>
              <div class="feature-card">
                <h4>Conteudo de Aprofundamento</h4>
                <p>Acesse material complementar para consolidar seu conhecimento.</p>
              </div>
              <div class="feature-card">
                <h4>Estudo Flexivel</h4>
                <p>Estude no seu ritmo, quando e onde quiser, em qualquer dispositivo.</p>
              </div>
              <div class="feature-card">
                <h4>Interface Moderna</h4>
                <p>Desfrute de uma interface intuitiva e responsiva para uma experiencia incrivel.</p>
              </div>
              <div class="feature-card">
                <h4>Animações Interativas</h4>
                <p>Engaje-se com animações e elementos visuais que tornam o estudo mais divertido.</p>
              </div>
            </div>
          </div>
          
          <div class="steps-section">
            <h3>Como comecar:</h3>
            <ul class="steps-list">
              <li>Faca login com suas credenciais acima</li>
              <li>Explore a area de estudos e familiarize-se com a interface</li>
              <li>Escolha a materia que deseja estudar</li>
              <li>Navegue pelos topicos e subtopicos</li>
              <li>Comece com os flashcards</li>
              <li>Use o aprofundamento para consolidar o conhecimento</li>
            </ul>
          </div>
          
          <div style="text-align: center;">
            <a href="${appUrl}/login" class="cta-button">
              Acessar Minha Area de Estudos
            </a>
          </div>
          
          <div class="bonus-section">
            <h4>Bonus:</h4>
            <p>Como voce foi adicionado pelo administrador, voce tem acesso completo a todas as funcionalidades, incluindo animações interativas e conteudo exclusivo!</p>
          </div>
        </div>
        
        <div class="footer">
          <p>Se voce tiver alguma duvida, nao hesite em nos contatar!</p>
          <p class="contact">suporte@flashconcards.com</p>
          <p>Estamos aqui para ajudar voce a alcancar seus objetivos!</p>
          <br>
          <p><small>Este email foi enviado automaticamente. Nao responda a este email.</small></p>
        </div>
      </div>
    </body>
    </html>
  `;
} 