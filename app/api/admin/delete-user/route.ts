import { NextRequest, NextResponse } from 'next/server';

// Verificar se as variáveis do Firebase Admin estão configuradas
const hasFirebaseAdminConfig = () => {
  return process.env.FIREBASE_PROJECT_ID && 
         process.env.FIREBASE_CLIENT_EMAIL && 
         process.env.FIREBASE_PRIVATE_KEY;
};

export async function POST(request: NextRequest) {
  try {
    // Verificar se o Firebase Admin está configurado
    if (!hasFirebaseAdminConfig()) {
      console.warn('Firebase Admin SDK não configurado - variáveis de ambiente ausentes');
      return NextResponse.json(
        { error: 'Serviço temporariamente indisponível' },
        { status: 503 }
      );
    }

    const { uid } = await request.json();

    if (!uid) {
      return NextResponse.json(
        { error: 'UID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    // Importar Firebase Admin dinamicamente apenas se configurado
    const { initializeApp, getApps, cert } = await import('firebase-admin/app');
    const { getAuth } = await import('firebase-admin/auth');

    // Inicializar Firebase Admin se ainda não foi inicializado
    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID!,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
          privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        }),
      });
    }

    const auth = getAuth();
    
    // Deletar usuário do Firebase Auth
    await auth.deleteUser(uid);

    console.log('✅ Usuário deletado com sucesso:', uid);

    return NextResponse.json({
      success: true,
      message: 'Usuário deletado com sucesso'
    });

  } catch (error: any) {
    console.error('❌ Erro ao deletar usuário:', error);
    
    if (error.code === 'auth/user-not-found') {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 