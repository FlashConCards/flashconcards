import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Inicializar Firebase Admin SDK
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const adminAuth = getAuth();
const adminDb = getFirestore();

export async function POST(request: NextRequest) {
  try {
    const { uid } = await request.json();

    if (!uid) {
      return NextResponse.json(
        { error: 'UID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    console.log('Deleting user from Auth:', uid);

    // Deletar do Firebase Auth
    await adminAuth.deleteUser(uid);
    console.log('User deleted from Auth:', uid);

    // Deletar do Firestore
    await adminDb.collection('users').doc(uid).delete();
    console.log('User deleted from Firestore:', uid);

    return NextResponse.json(
      { success: true, message: 'Usuário deletado com sucesso' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting user:', error);
    
    // Se o usuário não existe no Auth, apenas deletar do Firestore
    if (error.code === 'auth/user-not-found') {
      try {
        await adminDb.collection('users').doc(uid).delete();
        console.log('User deleted from Firestore only:', uid);
        return NextResponse.json(
          { success: true, message: 'Usuário deletado do Firestore (não encontrado no Auth)' },
          { status: 200 }
        );
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