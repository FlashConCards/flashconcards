import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function POST(request: NextRequest) {
  try {
    console.log('=== INÍCIO DA API DE UPLOAD ===');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'Arquivo e userId são obrigatórios' },
        { status: 400 }
      );
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Apenas arquivos de imagem são permitidos' },
        { status: 400 }
      );
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'A imagem deve ter no máximo 2MB' },
        { status: 400 }
      );
    }

    // Upload para Firebase Storage
    const storage = getStorage();
    const storagePath = `profile_photos/${userId}_${Date.now()}_${file.name}`;
    const storageReference = storageRef(storage, storagePath);
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    await uploadBytes(storageReference, uint8Array, { contentType: file.type });
    const downloadURL = await getDownloadURL(storageReference);

    // Salvar URL no Firestore
    if (db) {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        photoURL: downloadURL,
        updated_at: new Date().toISOString()
      }, { merge: true });
      return NextResponse.json({
        success: true,
        url: downloadURL,
        fileName: file.name
      });
    } else {
      return NextResponse.json(
        { error: 'Serviço temporariamente indisponível' },
        { status: 503 }
      );
    }
  } catch (error: any) {
    console.error('=== ERRO NO UPLOAD DE FOTO ===');
    console.error('Erro completo:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 