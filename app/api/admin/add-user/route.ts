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

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
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
    
    // Criar usuário no Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      emailVerified: false,
    });

    console.log('✅ Usuário criado com sucesso:', userRecord.uid);

    // Criar registro de pagamento aprovado no Firestore
    try {
      const { getFirestore } = await import('firebase-admin/firestore');
      const db = getFirestore();
      
      // Gerar um payment_id único
      const paymentId = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await db.collection('payments').add({
        payment_id: paymentId,
        email: email,
        first_name: email.split('@')[0], // Nome baseado no email
        last_name: '',
        amount: 0.00, // Gratuito para usuários adicionados pelo admin
        status: 'approved', // Aprovado automaticamente
        created_at: new Date().toISOString(),
        payment_method: 'admin',
        admin_created: true
      });

      console.log('✅ Registro de pagamento criado para:', email);
    } catch (firestoreError) {
      console.error('❌ Erro ao criar registro de pagamento:', firestoreError);
      // Não falha o processo se der erro no Firestore
    }

    return NextResponse.json({
      success: true,
      uid: userRecord.uid,
      email: userRecord.email,
      message: 'Usuário criado com sucesso e com acesso ao dashboard'
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