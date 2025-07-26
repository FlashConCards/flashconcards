import { NextRequest, NextResponse } from 'next/server';

// Verificar se as variáveis do Firebase Admin estão configuradas
const hasFirebaseAdminConfig = () => {
  return process.env.FIREBASE_PROJECT_ID && 
         process.env.FIREBASE_CLIENT_EMAIL && 
         process.env.FIREBASE_PRIVATE_KEY;
};

export async function GET(request: NextRequest) {
  try {
    // Verificar se o Firebase Admin está configurado
    if (!hasFirebaseAdminConfig()) {
      console.warn('Firebase Admin SDK não configurado - variáveis de ambiente ausentes');
      return NextResponse.json(
        { error: 'Serviço temporariamente indisponível' },
        { status: 503 }
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
    
    // Listar todos os usuários (limitado a 1000 para performance)
    const listUsersResult = await auth.listUsers(1000);

    const users = listUsersResult.users.map((user: any) => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
      disabled: user.disabled,
      createdAt: user.metadata.creationTime,
      lastSignIn: user.metadata.lastSignInTime
    }));

    console.log('✅ Usuários listados com sucesso:', users.length);

    return NextResponse.json({
      success: true,
      users,
      total: users.length
    });

  } catch (error: any) {
    console.error('❌ Erro ao listar usuários:', error);
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 