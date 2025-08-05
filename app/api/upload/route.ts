import { NextRequest, NextResponse } from 'next/server';

// Função para gerar URL mock temporária
function generateMockURL(fileName: string, path: string): string {
  const timestamp = Date.now();
  return `https://via.placeholder.com/300x300/4F46E5/FFFFFF?text=${encodeURIComponent(fileName)}&timestamp=${timestamp}`;
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

    console.log('Generating mock URL for testing...');
    // Gerar URL mock para teste
    const downloadURL = generateMockURL(file.name, path);
    console.log('Mock URL generated:', downloadURL);
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