import { NextResponse } from 'next/server';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../lib/firebase';

export async function POST() {
  try {
    // Criar usuário admin no Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      'claudioghabryel7@gmail.com',
      'Gabriel@123'
    );

    return NextResponse.json({
      success: true,
      message: 'Usuário admin criado com sucesso',
      uid: userCredential.user.uid
    });
  } catch (error: any) {
    // Se usuário já existe, não é erro
    if (error.code === 'auth/email-already-in-use') {
      return NextResponse.json({
        success: true,
        message: 'Usuário admin já existe',
        error: error.code
      });
    }

    console.error('Erro ao criar usuário admin:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
} 