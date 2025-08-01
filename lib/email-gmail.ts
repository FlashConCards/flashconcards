export interface GmailEmailData {
  userName: string;
  userEmail: string;
  courseName: string;
  accessExpiryDate?: string;
}

// URL do Google Apps Script (você vai criar isso)
const GOOGLE_APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL || '';

export const sendGmailWelcomeEmail = async (data: GmailEmailData) => {
  try {
    const { userName, userEmail, courseName, accessExpiryDate } = data;
    
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
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://flashconcards.vercel.app'
    };

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
    console.log('Gmail welcome email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending Gmail welcome email:', error);
    throw error;
  }
};

export const sendGmailAdminEmail = async (data: GmailEmailData) => {
  try {
    const { userName, userEmail, courseName } = data;
    
    const emailData = {
      type: 'admin',
      to: userEmail,
      subject: `🎉 Acesso Liberado! Bem-vindo ao ${courseName}!`,
      userName,
      courseName,
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://flashconcards.vercel.app'
    };

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
    console.log('Gmail admin email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending Gmail admin email:', error);
    throw error;
  }
}; 