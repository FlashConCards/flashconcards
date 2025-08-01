import { NextRequest, NextResponse } from 'next/server';
import { sendGmailDirectEmail } from '@/lib/email-gmail-direct';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userEmail, userName, courseName } = body;

    if (!userEmail || !userName || !courseName) {
      return NextResponse.json(
        { error: 'Dados obrigatórios: userEmail, userName, courseName' },
        { status: 400 }
      );
    }

    const result = await sendGmailDirectEmail({
      userName,
      userEmail,
      courseName
    });

    return NextResponse.json({
      success: true,
      message: 'Email preparado com sucesso!',
      result
    });
  } catch (error: any) {
    console.error('Error preparing email:', error);
    return NextResponse.json(
      { error: 'Erro ao preparar email', details: error.message },
      { status: 500 }
    );
  }
} 