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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 20px;
        }
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          position: relative;
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          padding: 50px 30px; 
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        .header h1 { 
          font-size: 32px; 
          margin-bottom: 15px; 
          font-weight: 800;
          position: relative;
          z-index: 1;
        }
        .header h2 { 
          font-size: 18px; 
          opacity: 0.9; 
          font-weight: 400;
          position: relative;
          z-index: 1;
        }
        .content { 
          padding: 50px 30px; 
          background: #ffffff;
        }
        .welcome-message {
          font-size: 20px;
          margin-bottom: 40px;
          color: #2d3748;
          text-align: center;
        }
        .course-highlight { 
          background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
          padding: 30px; 
          border-radius: 15px; 
          margin: 30px 0; 
          border: none;
          box-shadow: 0 10px 30px rgba(252, 182, 159, 0.3);
          position: relative;
          overflow: hidden;
        }
        .course-highlight::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: shine 3s infinite;
        }
        @keyframes shine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        .course-highlight h3 { 
          color: #d97706; 
          margin-bottom: 15px; 
          font-size: 24px;
          font-weight: 700;
          position: relative;
          z-index: 1;
        }
        .login-info {
          background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
          padding: 30px;
          border-radius: 15px;
          margin: 30px 0;
          border: none;
          box-shadow: 0 10px 30px rgba(168, 237, 234, 0.3);
          position: relative;
        }
        .login-info h3 {
          color: #065f46;
          margin-bottom: 20px;
          font-size: 20px;
          font-weight: 700;
        }
        .credentials {
          background: rgba(255, 255, 255, 0.9);
          padding: 20px;
          border-radius: 12px;
          margin: 20px 0;
          border: 2px solid #10b981;
          position: relative;
        }
        .credentials::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, #10b981, #059669, #047857);
          border-radius: 12px;
          z-index: -1;
          animation: borderGlow 2s ease-in-out infinite alternate;
        }
        @keyframes borderGlow {
          0% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        .credentials strong {
          color: #065f46;
          font-weight: 700;
        }
        .features-section {
          margin: 40px 0;
        }
        .features-section h3 {
          color: #1e293b;
          margin-bottom: 20px;
          font-size: 22px;
          font-weight: 700;
          text-align: center;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }
        .feature-card {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #bae6fd;
          transition: all 0.3s ease;
        }
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(186, 230, 253, 0.4);
        }
        .feature-card h4 {
          color: #0369a1;
          margin-bottom: 10px;
          font-weight: 600;
        }
        .feature-card p {
          color: #475569;
          font-size: 14px;
        }
        .tips-section {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          padding: 30px;
          border-radius: 15px;
          margin: 30px 0;
          border: none;
          box-shadow: 0 10px 30px rgba(254, 243, 199, 0.3);
        }
        .tips-section h3 {
          color: #92400e;
          margin-bottom: 20px;
          font-size: 20px;
          font-weight: 700;
        }
        .tips-list {
          list-style: none;
          padding: 0;
        }
        .tips-list li {
          padding: 12px 0;
          color: #78350f;
          position: relative;
          padding-left: 30px;
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
          background: #f59e0b;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
        }
        .cta-button { 
          display: inline-block; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          padding: 20px 40px; 
          text-decoration: none; 
          border-radius: 50px; 
          margin: 30px 0; 
          font-weight: 700;
          font-size: 18px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .cta-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s;
        }
        .cta-button:hover::before {
          left: 100%;
        }
        .cta-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(102, 126, 234, 0.6);
        }
        .bonus-section {
          background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
          padding: 30px;
          border-radius: 15px;
          margin: 30px 0;
          border: none;
          box-shadow: 0 10px 30px rgba(254, 202, 202, 0.3);
          position: relative;
        }
        .bonus-section::after {
          content: '★';
          position: absolute;
          top: -10px;
          right: 20px;
          font-size: 30px;
          color: #dc2626;
          animation: starTwinkle 2s ease-in-out infinite;
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        .bonus-section h4 {
          color: #991b1b;
          margin-bottom: 15px;
          font-size: 18px;
          font-weight: 700;
        }
        .footer { 
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%); 
          color: #cbd5e1; 
          padding: 40px 30px; 
          text-align: center; 
          font-size: 14px;
        }
        .footer p {
          margin: 10px 0;
        }
        .footer .contact {
          color: #60a5fa;
          font-weight: 600;
        }
        .footer .contact:hover {
          color: #93c5fd;
        }
        @media (max-width: 600px) {
          .email-container { margin: 10px; }
          .header, .content, .footer { padding: 30px 20px; }
          .header h1 { font-size: 28px; }
          .features-grid { grid-template-columns: 1fr; }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>FlashConCards</h1>
          <h2>Parabéns pela sua escolha!</h2>
        </div>
        
        <div class="content">
          <div class="welcome-message">
            <p>Olá <strong>${userName}</strong>!</p>
            <p>Estamos muito felizes em ter você conosco! Você acaba de dar um passo importante para alavancar seus estudos e alcançar seus objetivos.</p>
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
              <p><strong>Acesse:</strong> <a href="${appUrl}/login" style="color: #059669; text-decoration: none; font-weight: 600;">${appUrl}/login</a></p>
            </div>
          </div>
          
          <div class="features-section">
            <h3>O que você tem acesso agora:</h3>
            <div class="features-grid">
              <div class="feature-card">
                <h4>Flashcards Interativos</h4>
                <p>Estude com flashcards personalizados e inteligentes que se adaptam ao seu progresso.</p>
              </div>
              <div class="feature-card">
                <h4>Estatísticas Detalhadas</h4>
                <p>Acompanhe seu progresso com gráficos e relatórios em tempo real.</p>
              </div>
              <div class="feature-card">
                <h4>Conteúdo de Aprofundamento</h4>
                <p>Acesse material complementar para consolidar seu conhecimento.</p>
              </div>
              <div class="feature-card">
                <h4>Estudo Flexível</h4>
                <p>Estude no seu ritmo, quando e onde quiser, em qualquer dispositivo.</p>
              </div>
              <div class="feature-card">
                <h4>Interface Moderna</h4>
                <p>Desfrute de uma interface intuitiva e responsiva para uma experiência incrível.</p>
              </div>
              <div class="feature-card">
                <h4>Animações Interativas</h4>
                <p>Engaje-se com animações e elementos visuais que tornam o estudo mais divertido.</p>
              </div>
            </div>
          </div>
          
          <div class="tips-section">
            <h3>Como começar a estudar:</h3>
            <ul class="tips-list">
              <li>Faça login com suas credenciais acima</li>
              <li>Explore a área de estudos e familiarize-se com a interface</li>
              <li>Comece pelos subtópicos que você tem mais dificuldade</li>
              <li>Use o sistema de aprofundamento para consolidar o conhecimento</li>
              <li>Acompanhe suas estatísticas para identificar pontos de melhoria</li>
              <li>Estude regularmente para manter o conteúdo fresco na memória</li>
              <li>Configure lembretes para manter a consistência nos estudos</li>
            </ul>
          </div>
          
          <div style="text-align: center;">
            <a href="${appUrl}/login" class="cta-button">
              Acessar Minha Área de Estudos
            </a>
          </div>
          
          <div class="bonus-section">
            <h4>Bônus Especial:</h4>
            <p>Como você é um dos nossos primeiros alunos, você tem acesso completo a todas as funcionalidades premium, incluindo animações interativas e conteúdo exclusivo!</p>
          </div>
        </div>
        
        <div class="footer">
          <p>Se você tiver alguma dúvida, não hesite em nos contatar!</p>
          <p class="contact">suporte@flashconcards.com</p>
          <p>Estamos aqui para ajudar você a alcançar seus objetivos!</p>
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
          color: #2d3748; 
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          min-height: 100vh;
          padding: 20px;
        }
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          position: relative;
        }
        .header { 
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
          color: white; 
          padding: 50px 30px; 
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        .header h1 { 
          font-size: 32px; 
          margin-bottom: 15px; 
          font-weight: 800;
          position: relative;
          z-index: 1;
        }
        .header h2 { 
          font-size: 18px; 
          opacity: 0.9; 
          font-weight: 400;
          position: relative;
          z-index: 1;
        }
        .content { 
          padding: 50px 30px; 
          background: #ffffff;
        }
        .welcome-message {
          font-size: 20px;
          margin-bottom: 40px;
          color: #2d3748;
          text-align: center;
        }
        .course-highlight { 
          background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
          padding: 30px; 
          border-radius: 15px; 
          margin: 30px 0; 
          border: none;
          box-shadow: 0 10px 30px rgba(212, 237, 218, 0.3);
          position: relative;
          overflow: hidden;
        }
        .course-highlight::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: shine 3s infinite;
        }
        @keyframes shine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        .course-highlight h3 { 
          color: #155724; 
          margin-bottom: 15px; 
          font-size: 24px;
          font-weight: 700;
          position: relative;
          z-index: 1;
        }
        .login-info {
          background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
          padding: 30px;
          border-radius: 15px;
          margin: 30px 0;
          border: none;
          box-shadow: 0 10px 30px rgba(168, 237, 234, 0.3);
          position: relative;
        }
        .login-info h3 {
          color: #065f46;
          margin-bottom: 20px;
          font-size: 20px;
          font-weight: 700;
        }
        .credentials {
          background: rgba(255, 255, 255, 0.9);
          padding: 20px;
          border-radius: 12px;
          margin: 20px 0;
          border: 2px solid #10b981;
          position: relative;
        }
        .credentials::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, #10b981, #059669, #047857);
          border-radius: 12px;
          z-index: -1;
          animation: borderGlow 2s ease-in-out infinite alternate;
        }
        @keyframes borderGlow {
          0% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        .credentials strong {
          color: #065f46;
          font-weight: 700;
        }
        .features-section {
          margin: 40px 0;
        }
        .features-section h3 {
          color: #1e293b;
          margin-bottom: 20px;
          font-size: 22px;
          font-weight: 700;
          text-align: center;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }
        .feature-card {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #bae6fd;
          transition: all 0.3s ease;
        }
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(186, 230, 253, 0.4);
        }
        .feature-card h4 {
          color: #0369a1;
          margin-bottom: 10px;
          font-weight: 600;
        }
        .feature-card p {
          color: #475569;
          font-size: 14px;
        }
        .steps-section {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          padding: 30px;
          border-radius: 15px;
          margin: 30px 0;
          border: none;
          box-shadow: 0 10px 30px rgba(254, 243, 199, 0.3);
        }
        .steps-section h3 {
          color: #92400e;
          margin-bottom: 20px;
          font-size: 20px;
          font-weight: 700;
        }
        .steps-list {
          list-style: none;
          padding: 0;
        }
        .steps-list li {
          padding: 12px 0;
          color: #78350f;
          position: relative;
          padding-left: 40px;
          font-weight: 500;
        }
        .steps-list li:before {
          content: counter(step-counter);
          counter-increment: step-counter;
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
          color: white;
          width: 25px;
          height: 25px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          box-shadow: 0 5px 15px rgba(66, 153, 225, 0.4);
        }
        .steps-list {
          counter-reset: step-counter;
        }
        .cta-button { 
          display: inline-block; 
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
          color: white; 
          padding: 20px 40px; 
          text-decoration: none; 
          border-radius: 50px; 
          margin: 30px 0; 
          font-weight: 700;
          font-size: 18px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(40, 167, 69, 0.4);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .cta-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s;
        }
        .cta-button:hover::before {
          left: 100%;
        }
        .cta-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(40, 167, 69, 0.6);
        }
        .bonus-section {
          background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
          padding: 30px;
          border-radius: 15px;
          margin: 30px 0;
          border: none;
          box-shadow: 0 10px 30px rgba(212, 237, 218, 0.3);
          position: relative;
        }
        .bonus-section::after {
          content: '★';
          position: absolute;
          top: -10px;
          right: 20px;
          font-size: 30px;
          color: #155724;
          animation: starTwinkle 2s ease-in-out infinite;
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        .bonus-section h4 {
          color: #155724;
          margin-bottom: 15px;
          font-size: 18px;
          font-weight: 700;
        }
        .footer { 
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%); 
          color: #cbd5e1; 
          padding: 40px 30px; 
          text-align: center; 
          font-size: 14px;
        }
        .footer p {
          margin: 10px 0;
        }
        .footer .contact {
          color: #60a5fa;
          font-weight: 600;
        }
        .footer .contact:hover {
          color: #93c5fd;
        }
        @media (max-width: 600px) {
          .email-container { margin: 10px; }
          .header, .content, .footer { padding: 30px 20px; }
          .header h1 { font-size: 28px; }
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
            <p>Olá <strong>${userName}</strong>!</p>
            <p>Ótimas notícias! Seu acesso ao curso foi liberado pelo administrador e você já pode começar a estudar!</p>
          </div>
          
          <div class="course-highlight">
            <h3>${courseName}</h3>
            <p><strong>Seu acesso está ativo e pronto para uso!</strong></p>
          </div>
          
          <div class="login-info">
            <h3>Suas Credenciais de Acesso:</h3>
            <div class="credentials">
              <p><strong>Email:</strong> ${userEmail || 'Seu email'}</p>
              <p><strong>Senha:</strong> ${userPassword || '123456'}</p>
              <p><strong>Acesse:</strong> <a href="${appUrl}/login" style="color: #059669; text-decoration: none; font-weight: 600;">${appUrl}/login</a></p>
            </div>
          </div>
          
          <div class="features-section">
            <h3>O que você tem acesso agora:</h3>
            <div class="features-grid">
              <div class="feature-card">
                <h4>Flashcards Interativos</h4>
                <p>Estude com flashcards personalizados e inteligentes que se adaptam ao seu progresso.</p>
              </div>
              <div class="feature-card">
                <h4>Estatísticas Detalhadas</h4>
                <p>Acompanhe seu progresso com gráficos e relatórios em tempo real.</p>
              </div>
              <div class="feature-card">
                <h4>Conteúdo de Aprofundamento</h4>
                <p>Acesse material complementar para consolidar seu conhecimento.</p>
              </div>
              <div class="feature-card">
                <h4>Estudo Flexível</h4>
                <p>Estude no seu ritmo, quando e onde quiser, em qualquer dispositivo.</p>
              </div>
              <div class="feature-card">
                <h4>Interface Moderna</h4>
                <p>Desfrute de uma interface intuitiva e responsiva para uma experiência incrível.</p>
              </div>
              <div class="feature-card">
                <h4>Animações Interativas</h4>
                <p>Engaje-se com animações e elementos visuais que tornam o estudo mais divertido.</p>
              </div>
            </div>
          </div>
          
          <div class="steps-section">
            <h3>Como começar:</h3>
            <ul class="steps-list">
              <li>Faça login com suas credenciais acima</li>
              <li>Explore a área de estudos e familiarize-se com a interface</li>
              <li>Escolha a matéria que deseja estudar</li>
              <li>Navegue pelos tópicos e subtópicos</li>
              <li>Comece com os flashcards</li>
              <li>Use o aprofundamento para consolidar o conhecimento</li>
            </ul>
          </div>
          
          <div style="text-align: center;">
            <a href="${appUrl}/login" class="cta-button">
              Acessar Minha Área de Estudos
            </a>
          </div>
          
          <div class="bonus-section">
            <h4>Bônus:</h4>
            <p>Como você foi adicionado pelo administrador, você tem acesso completo a todas as funcionalidades, incluindo animações interativas e conteúdo exclusivo!</p>
          </div>
        </div>
        
        <div class="footer">
          <p>Se você tiver alguma dúvida, não hesite em nos contatar!</p>
          <p class="contact">suporte@flashconcards.com</p>
          <p>Estamos aqui para ajudar você a alcançar seus objetivos!</p>
          <br>
          <p><small>Este email foi enviado automaticamente. Não responda a este email.</small></p>
        </div>
      </div>
    </body>
    </html>
  `;
} 