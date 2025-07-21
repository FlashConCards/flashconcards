import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Inicializar Firebase Admin se ainda não foi inicializado
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const auth = getAuth();
    
    // Criar usuário no Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      emailVerified: false,
    });

    console.log('✅ Usuário criado com sucesso:', userRecord.uid);

    return NextResponse.json({
      success: true,
      uid: userRecord.uid,
      email: userRecord.email,
      message: 'Usuário criado com sucesso'
    });

  } catch (error: any) {
    console.error('❌ Erro ao criar usuário:', error);
    
    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json(
        { error: 'Este email já está em uso' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 