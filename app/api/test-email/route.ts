import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail, sendAdminWelcomeEmail } from '@/lib/email';

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

    let result;
    
    if (type === 'admin') {
      result = await sendAdminWelcomeEmail({
        userName,
        userEmail,
        courseName
      });
    } else {
      result = await sendWelcomeEmail({
        userName,
        userEmail,
        courseName,
        accessExpiryDate: '31/12/2024'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Email enviado com sucesso!',
      result
    });
  } catch (error: any) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: 'Erro ao enviar email', details: error.message },
      { status: 500 }
    );
  }
} 