import { NextRequest, NextResponse } from 'next/server';
import { sendSendGridWelcomeEmail, sendSendGridAdminEmail } from '@/lib/email-sendgrid';

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

    if (!process.env.SENDGRID_API_KEY) {
      return NextResponse.json(
        { error: 'SENDGRID_API_KEY não configurada. Configure no Vercel.' },
        { status: 500 }
      );
    }

    let result;
    
    if (type === 'admin') {
      result = await sendSendGridAdminEmail({
        userName,
        userEmail,
        courseName
      });
    } else {
      result = await sendSendGridWelcomeEmail({
        userName,
        userEmail,
        courseName,
        accessExpiryDate: '31/12/2024'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Email enviado com sucesso via SendGrid!',
      result
    });
  } catch (error: any) {
    console.error('Error sending SendGrid test email:', error);
    return NextResponse.json(
      { error: 'Erro ao enviar email via SendGrid', details: error.message },
      { status: 500 }
    );
  }
} 