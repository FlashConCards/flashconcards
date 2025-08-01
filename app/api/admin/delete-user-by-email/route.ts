import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json(
      { error: 'Email do usuário é obrigatório' },
      { status: 400 }
    );
  }

  try {
    // Verificar se as variáveis de ambiente estão configuradas
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      console.error('Firebase Admin SDK credentials not configured');
      return NextResponse.json(
        { error: 'Configuração do Firebase Admin SDK não encontrada. Configure as variáveis de ambiente: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY' },
        { status: 500 }
      );
    }

    // Inicializar Firebase Admin SDK apenas quando a função for chamada
    if (!getApps().length) {
      try {
        initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          }),
        });
      } catch (initError: any) {
        console.error('Error initializing Firebase Admin SDK:', initError);
        return NextResponse.json(
          { error: `Erro ao inicializar Firebase Admin SDK: ${initError.message}` },
          { status: 500 }
        );
      }
    }

    const adminAuth = getAuth();
    const adminDb = getFirestore();

    console.log('Looking for user with email:', email);

    // Buscar usuário por email no Auth
    const userRecord = await adminAuth.getUserByEmail(email);
    const uid = userRecord.uid;

    console.log('Found user with UID:', uid);

    // Deletar do Firebase Auth
    await adminAuth.deleteUser(uid);
    console.log('User deleted from Auth:', uid);

    // Deletar do Firestore
    await adminDb.collection('users').doc(uid).delete();
    console.log('User deleted from Firestore:', uid);

    return NextResponse.json(
      { success: true, message: 'Usuário deletado com sucesso', uid },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting user by email:', error);
    
    // Se o usuário não existe no Auth, apenas deletar do Firestore
    if (error.code === 'auth/user-not-found') {
      try {
        const adminDb = getFirestore();
        // Buscar no Firestore por email
        const usersRef = adminDb.collection('users');
        const q = usersRef.where('email', '==', email);
        const querySnapshot = await q.get();
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          await doc.ref.delete();
          console.log('User deleted from Firestore only:', email);
          return NextResponse.json(
            { success: true, message: 'Usuário deletado do Firestore (não encontrado no Auth)' },
            { status: 200 }
          );
        } else {
          return NextResponse.json(
            { error: 'Usuário não encontrado no Auth nem no Firestore' },
            { status: 404 }
          );
        }
      } catch (firestoreError) {
        console.error('Error deleting from Firestore:', firestoreError);
        return NextResponse.json(
          { error: 'Erro ao deletar do Firestore' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: `Erro ao deletar usuário: ${error.message}` },
      { status: 500 }
    );
  }
} 