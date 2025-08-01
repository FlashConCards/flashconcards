export interface GmailDirectData {
  userName: string;
  userEmail: string;
  courseName: string;
  accessExpiryDate?: string;
  userPassword?: string;
}

// URL do Google Apps Script (configurada no Vercel)
const GOOGLE_APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL || '';

// Função para enviar email automático via Google Apps Script
export const sendGmailDirectEmail = async (data: GmailDirectData) => {
  try {
    const { userName, userEmail, courseName, accessExpiryDate, userPassword } = data;
    
    const expiryText = accessExpiryDate 
      ? `Seu acesso estará disponível até ${accessExpiryDate}.`
      : 'Seu acesso não tem data de expiração.';

    const emailData = {
      type: 'welcome',
      to: userEmail,
      subject: `🎉 Parabéns! Bem-vindo ao ${courseName}!`,
      userName,
      courseName,
      expiryText,
      userEmail,
      userPassword: userPassword || '123456',
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://flashconcards.vercel.app'
    };

    // Verificar se a URL do Google Apps Script está configurada
    if (!GOOGLE_APPS_SCRIPT_URL) {
      console.error('❌ GOOGLE_APPS_SCRIPT_URL não configurada');
      throw new Error('Configuração de email não encontrada');
    }

    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Email automático enviado com sucesso:', result);
    return result;
  } catch (error) {
    console.error('❌ Erro ao enviar email automático:', error);
    throw error;
  }
};

// Função para admin - email automático
export const sendGmailDirectAdminEmail = async (data: GmailDirectData) => {
  try {
    const { userName, userEmail, courseName, userPassword } = data;
    
    const emailData = {
      type: 'admin',
      to: userEmail,
      subject: `🎉 Acesso Liberado! Bem-vindo ao ${courseName}!`,
      userName,
      courseName,
      userEmail,
      userPassword: userPassword || '123456',
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://flashconcards.vercel.app'
    };

    // Verificar se a URL do Google Apps Script está configurada
    if (!GOOGLE_APPS_SCRIPT_URL) {
      console.error('❌ GOOGLE_APPS_SCRIPT_URL não configurada');
      throw new Error('Configuração de email não encontrada');
    }

    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Email admin automático enviado com sucesso:', result);
    return result;
  } catch (error) {
    console.error('❌ Erro ao enviar email admin automático:', error);
    throw error;
  }
}; 