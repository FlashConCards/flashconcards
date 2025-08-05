import { NextRequest, NextResponse } from 'next/server';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Configuração do Firebase para o servidor
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Inicializar Firebase apenas uma vez
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export async function POST(request: NextRequest) {
  try {
    console.log('=== API UPLOAD START ===');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const path = formData.get('path') as string;

    console.log('File received:', file?.name, file?.size, file?.type);
    console.log('Path:', path);

    if (!file || !path) {
      console.log('Missing file or path');
      return NextResponse.json(
        { error: 'Arquivo e caminho são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      console.log('Invalid file type:', file.type);
      return NextResponse.json(
        { error: 'Tipo de arquivo não suportado. Use apenas imagens (JPEG, PNG, GIF, WebP).' },
        { status: 400 }
      );
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.log('File too large:', file.size);
      return NextResponse.json(
        { error: 'Arquivo muito grande. Tamanho máximo: 5MB.' },
        { status: 400 }
      );
    }

    console.log('Converting file to buffer...');
    // Converter File para Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log('Buffer created, size:', buffer.length);

    console.log('Creating storage reference...');
    // Upload para Firebase Storage
    const storageRef = ref(storage, path);
    const metadata = {
      contentType: file.type,
      cacheControl: 'public, max-age=31536000',
    };

    console.log('Uploading to Firebase Storage...');
    const snapshot = await uploadBytes(storageRef, buffer, metadata);
    console.log('Upload completed, getting download URL...');
    
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Download URL:', downloadURL);
    console.log('=== API UPLOAD END ===');

    return NextResponse.json({ 
      success: true, 
      url: downloadURL 
    });

  } catch (error: any) {
    console.error('=== API UPLOAD ERROR ===');
    console.error('Error uploading file:', error);
    console.error('Error type:', typeof error);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
    console.error('=== API UPLOAD ERROR END ===');
    
    return NextResponse.json(
      { error: `Erro no upload: ${error.message}` },
      { status: 500 }
    );
  }
} 