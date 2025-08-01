export interface GmailDirectData {
  userName: string;
  userEmail: string;
  courseName: string;
}

// Função super simples para enviar email via Gmail
export const sendGmailDirectEmail = async (data: GmailDirectData) => {
  try {
    const { userName, userEmail, courseName } = data;
    
    // Criar link direto para Gmail com tudo preenchido
    const subject = encodeURIComponent(`🎉 Parabéns! Bem-vindo ao ${courseName}!`);
    const body = encodeURIComponent(`
Olá ${userName}! 👋

Estamos muito felizes em ter você conosco! Você acaba de dar um passo importante para alavancar seus estudos e alcançar seus objetivos.

🎯 ${courseName}

🚀 O que você tem acesso agora:
• 📚 Flashcards interativos e personalizados
• 📊 Estatísticas detalhadas do seu progresso
• 🎯 Conteúdo de aprofundamento
• ⏰ Estudo flexível no seu ritmo

💡 Dicas para começar:
• Comece pelos subtópicos que você tem mais dificuldade
• Use o sistema de aprofundamento para consolidar o conhecimento
• Acompanhe suas estatísticas para identificar pontos de melhoria
• Estude regularmente para manter o conteúdo fresco na memória

🎁 Bônus Especial:
Como você é um dos nossos primeiros alunos, você tem acesso completo a todas as funcionalidades premium!

Acesse: https://flashconcards.vercel.app/dashboard

Se você tiver alguma dúvida, não hesite em nos contatar!
📧 suporte@flashconcards.com

Estamos aqui para ajudar você a alcançar seus objetivos!

---
Este email foi enviado automaticamente. Não responda a este email.
    `);

    // Link direto para Gmail
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${userEmail}&su=${subject}&body=${body}`;
    
    console.log('📧 Email preparado para:', userEmail);
    console.log('🔗 Link Gmail:', gmailUrl);
    
    // Em produção, você pode abrir o Gmail automaticamente
    if (typeof window !== 'undefined') {
      window.open(gmailUrl, '_blank');
    }
    
    return {
      success: true,
      message: 'Email preparado com sucesso!',
      gmailUrl,
      userEmail
    };
  } catch (error) {
    console.error('Erro ao preparar email:', error);
    throw error;
  }
};

// Função para admin
export const sendGmailDirectAdminEmail = async (data: GmailDirectData) => {
  try {
    const { userName, userEmail, courseName } = data;
    
    const subject = encodeURIComponent(`🎉 Acesso Liberado! Bem-vindo ao ${courseName}!`);
    const body = encodeURIComponent(`
Olá ${userName}! 👋

Ótimas notícias! Seu acesso ao curso foi liberado pelo administrador e você já pode começar a estudar!

🎯 ${courseName}
✅ Seu acesso está ativo e pronto para uso!

🚀 O que você tem acesso agora:
• 📚 Flashcards interativos e personalizados
• 📊 Estatísticas detalhadas do seu progresso
• 🎯 Conteúdo de aprofundamento
• ⏰ Estudo flexível no seu ritmo
• 📱 Acesso em qualquer dispositivo

💡 Como começar:
1. Acesse sua área de estudos
2. Escolha a matéria que deseja estudar
3. Navegue pelos tópicos e subtópicos
4. Comece com os flashcards
5. Use o aprofundamento para consolidar o conhecimento

Acesse: https://flashconcards.vercel.app/dashboard

🎁 Bônus:
Como você foi adicionado pelo administrador, você tem acesso completo a todas as funcionalidades!

Se você tiver alguma dúvida, não hesite em nos contatar!
📧 suporte@flashconcards.com

Estamos aqui para ajudar você a alcançar seus objetivos!

---
Este email foi enviado automaticamente. Não responda a este email.
    `);

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${userEmail}&su=${subject}&body=${body}`;
    
    console.log('📧 Email admin preparado para:', userEmail);
    console.log('🔗 Link Gmail:', gmailUrl);
    
    if (typeof window !== 'undefined') {
      window.open(gmailUrl, '_blank');
    }
    
    return {
      success: true,
      message: 'Email admin preparado com sucesso!',
      gmailUrl,
      userEmail
    };
  } catch (error) {
    console.error('Erro ao preparar email admin:', error);
    throw error;
  }
}; 