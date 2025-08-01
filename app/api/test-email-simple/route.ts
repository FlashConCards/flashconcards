import { NextRequest, NextResponse } from 'next/server';
import { sendSimpleWelcomeEmail, sendSimpleAdminEmail } from '@/lib/email-simple';

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
      result = await sendSimpleAdminEmail({
        userName,
        userEmail,
        courseName
      });
    } else {
      result = await sendSimpleWelcomeEmail({
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