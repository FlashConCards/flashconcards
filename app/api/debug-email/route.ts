import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const googleAppsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    
    return NextResponse.json({
      success: true,
      debug: {
        googleAppsScriptUrl: googleAppsScriptUrl ? '✅ Configurada' : '❌ Não configurada',
        appUrl: appUrl || 'https://flashconcards.vercel.app',
        hasGoogleUrl: !!googleAppsScriptUrl,
        urlLength: googleAppsScriptUrl?.length || 0
      }
    })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
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