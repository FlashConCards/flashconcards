import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

// Inicializar Firebase Admin se ainda não foi inicializado
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== INÍCIO DA API DE UPLOAD ===');
    
    // Verificar se as variáveis do Firebase Admin estão configuradas
    const hasFirebaseAdminConfig = () => {
      return process.env.FIREBASE_PROJECT_ID && 
             process.env.FIREBASE_CLIENT_EMAIL && 
             process.env.FIREBASE_PRIVATE_KEY;
    };

    if (!hasFirebaseAdminConfig()) {
      console.error('Firebase Admin SDK não configurado - variáveis de ambiente ausentes');
      return NextResponse.json(
        { error: 'Serviço temporariamente indisponível' },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    console.log('Dados recebidos:', { userId, fileName: file?.name, fileSize: file?.size });

    if (!file || !userId) {
      console.error('Dados obrigatórios ausentes:', { hasFile: !!file, hasUserId: !!userId });
      return NextResponse.json(
        { error: 'Arquivo e userId são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      console.error('Tipo de arquivo inválido:', file.type);
      return NextResponse.json(
        { error: 'Apenas arquivos de imagem são permitidos' },
        { status: 400 }
      );
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('Arquivo muito grande:', file.size);
      return NextResponse.json(
        { error: 'A imagem deve ter no máximo 5MB' },
        { status: 400 }
      );
    }

    console.log('=== UPLOAD VIA API ===');
    console.log('UserId:', userId);
    console.log('Arquivo:', { name: file.name, size: file.size, type: file.type });

    // Converter File para Buffer
    console.log('Convertendo arquivo para buffer...');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log('Buffer criado, tamanho:', buffer.length);

    // Gerar nome único
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const uniqueFileName = `profile_${Date.now()}.${fileExtension}`;
    const filePath = `profile-photos/${userId}/${uniqueFileName}`;

    console.log('Caminho do arquivo:', filePath);

    // Upload via Firebase Admin SDK
    console.log('Inicializando Firebase Storage...');
    const storage = getStorage();
    console.log('Storage inicializado');
    
    const bucket = storage.bucket();
    console.log('Bucket obtido:', bucket.name);
    
    const fileRef = bucket.file(filePath);
    console.log('Referência do arquivo criada');

    console.log('Iniciando upload...');
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    console.log('Upload concluído via API');

    // Tornar o arquivo público
    console.log('Tornando arquivo público...');
    await fileRef.makePublic();

    // Obter URL pública
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    console.log('URL pública:', publicUrl);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: uniqueFileName
    });

  } catch (error: any) {
    console.error('=== ERRO NO UPLOAD VIA API ===');
    console.error('Erro completo:', error);
    console.error('Código do erro:', error.code);
    console.error('Mensagem do erro:', error.message);
    console.error('Stack trace:', error.stack);
    
    let errorMessage = 'Erro interno do servidor';
    
    if (error.code === 'storage/unauthorized') {
      errorMessage = 'Erro de permissão no Firebase Storage';
    } else if (error.code === 'storage/quota-exceeded') {
      errorMessage = 'Limite de armazenamento excedido';
    } else if (error.message?.includes('Firebase Admin SDK não configurado')) {
      errorMessage = 'Serviço temporariamente indisponível';
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 