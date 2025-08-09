import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

// Inicializar Firebase Admin se ainda não foi inicializado
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
  }
}

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

    try {
      console.log('Uploading to Firebase Storage...');
      const bucket = getStorage().bucket();
      
      // Gerar nome único para o arquivo
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${path}/${fileName}`;
      
      console.log('File path:', filePath);
      
      // Converter file para buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Upload para Firebase Storage
      const fileRef = bucket.file(filePath);
      await fileRef.save(buffer, {
        metadata: {
          contentType: file.type,
        },
      });
      
      // Tornar o arquivo público
      await fileRef.makePublic();
      
      // Gerar URL de download
      const downloadURL = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
      
      console.log('File uploaded successfully:', downloadURL);
      console.log('=== API UPLOAD END ===');
      
      return NextResponse.json({ 
        success: true, 
        url: downloadURL 
      });
    } catch (uploadError: any) {
      console.error('Firebase Storage upload error:', uploadError);
      
      // Fallback para URL mock se Firebase falhar
      console.log('Falling back to mock URL...');
      const timestamp = Date.now();
      const mockURL = `https://via.placeholder.com/300x300/4F46E5/FFFFFF?text=${encodeURIComponent(file.name)}&timestamp=${timestamp}`;
      
      return NextResponse.json({ 
        success: true, 
        url: mockURL,
        warning: 'Usando URL mock - configurar Firebase Storage'
      });
    }

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