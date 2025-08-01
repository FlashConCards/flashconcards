import { sendGmailDirectEmail, sendGmailDirectAdminEmail } from '@/lib/email-gmail-direct';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { type, userEmail, userName, courseName } = await request.json();

    let result;
    
    if (type === 'admin') {
      result = await sendGmailDirectAdminEmail({
        userName: userName || 'Usuário Teste',
        userEmail: userEmail || 'teste@email.com',
        courseName: courseName || 'Curso Teste'
      });
    } else {
      result = await sendGmailDirectEmail({
        userName: userName || 'Usuário Teste',
        userEmail: userEmail || 'teste@email.com',
        courseName: courseName || 'Curso Teste',
        accessExpiryDate: '31/12/2024'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Email enviado com sucesso!',
      result
    });
  } catch (error: any) {
    console.error('❌ Erro ao enviar email de teste:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Erro desconhecido',
        details: 'Verifique se GOOGLE_APPS_SCRIPT_URL está configurada no Vercel'
      },
      { status: 500 }
    );
  }
} 