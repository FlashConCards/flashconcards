import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email e código são obrigatórios' },
        { status: 400 }
      );
    }

    console.log('🔍 Verificando código para:', email);

    // Verificar se existe código salvo para este email
    if (!global.verificationCodes || !global.verificationCodes.has(email)) {
      return NextResponse.json(
        { error: 'Código não encontrado. Solicite um novo código.' },
        { status: 404 }
      );
    }

    const savedData = global.verificationCodes.get(email);
    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000; // 10 minutos em millisegundos

    // Verificar se o código expirou
    if (now - savedData.timestamp > tenMinutes) {
      global.verificationCodes.delete(email);
      return NextResponse.json(
        { error: 'Código expirado. Solicite um novo código.' },
        { status: 400 }
      );
    }

    // Verificar se o código está correto
    if (savedData.code !== code) {
      return NextResponse.json(
        { error: 'Código incorreto. Verifique e tente novamente.' },
        { status: 400 }
      );
    }

    // Código válido - remover da memória
    global.verificationCodes.delete(email);

    console.log('✅ Código verificado com sucesso para:', email);

    return NextResponse.json({
      success: true,
      message: 'Código verificado com sucesso',
      displayName: savedData.displayName
    });

  } catch (error: any) {
    console.error('❌ Erro ao verificar código:', error);
    return NextResponse.json(
      { error: `Erro ao verificar código: ${error.message}` },
      { status: 500 }
    );
  }
} 