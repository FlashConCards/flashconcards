import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const googleScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
    
    return NextResponse.json({
      success: true,
      googleScriptUrl: googleScriptUrl ? 'Configurada' : 'NÃO CONFIGURADA',
      hasUrl: !!googleScriptUrl,
      urlLength: googleScriptUrl?.length || 0
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erro ao verificar configuração', details: error.message },
      { status: 500 }
    );
  }
}

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

    const googleScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
    
    if (!googleScriptUrl) {
      return NextResponse.json(
        { error: 'GOOGLE_APPS_SCRIPT_URL não configurada' },
        { status: 500 }
      );
    }

    // Testar envio direto para o Google Apps Script
    const testData = {
      type: 'welcome',
      to: userEmail,
      subject: `🎉 Teste - Bem-vindo ao ${courseName}!`,
      userName,
      courseName,
      expiryText: '31/12/2024',
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://flashconcards.vercel.app'
    };

    console.log('Enviando teste para:', googleScriptUrl);
    console.log('Dados:', testData);

    const response = await fetch(googleScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log('Resposta do Google Apps Script:', result);

    return NextResponse.json({
      success: true,
      message: 'Teste enviado com sucesso!',
      googleScriptResponse: result,
      testData
    });
  } catch (error: any) {
    console.error('Erro no teste:', error);
    return NextResponse.json(
      { error: 'Erro ao testar email', details: error.message },
      { status: 500 }
    );
  }
} 