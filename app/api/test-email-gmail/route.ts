import { NextRequest, NextResponse } from 'next/server';
import { sendGmailWelcomeEmail, sendGmailAdminEmail } from '@/lib/email-gmail';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, userEmail, userName, courseName } = body;

    if (!userEmail || !userName || !courseName) {
      return NextResponse.json(
        { error: 'Dados obrigatórios: userEmail, userName, courseName' },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_APPS_SCRIPT_URL) {
      return NextResponse.json(
        { error: 'GOOGLE_APPS_SCRIPT_URL não configurada. Siga o tutorial para configurar.' },
        { status: 500 }
      );
    }

    let result;
    
    if (type === 'admin') {
      result = await sendGmailAdminEmail({
        userName,
        userEmail,
        courseName
      });
    } else {
      result = await sendGmailWelcomeEmail({
        userName,
        userEmail,
        courseName,
        accessExpiryDate: '31/12/2024'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Email enviado com sucesso via Gmail!',
      result
    });
  } catch (error: any) {
    console.error('Error sending Gmail test email:', error);
    return NextResponse.json(
      { error: 'Erro ao enviar email via Gmail', details: error.message },
      { status: 500 }
    );
  }
} 