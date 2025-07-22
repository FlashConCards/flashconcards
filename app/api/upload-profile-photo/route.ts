import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    console.log('=== INÍCIO DA API DE UPLOAD SIMPLIFICADA ===');
    
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

    // Validar tamanho (máximo 2MB para base64)
    if (file.size > 2 * 1024 * 1024) {
      console.error('Arquivo muito grande:', file.size);
      return NextResponse.json(
        { error: 'A imagem deve ter no máximo 2MB' },
        { status: 400 }
      );
    }

    console.log('=== UPLOAD SIMPLIFICADO ===');
    console.log('UserId:', userId);
    console.log('Arquivo:', { name: file.name, size: file.size, type: file.type });

    // Converter arquivo para base64
    console.log('Convertendo arquivo para base64...');
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;
    
    console.log('Base64 criado, tamanho:', base64.length);

    // Salvar no Firestore
    if (db) {
      console.log('Salvando no Firestore...');
      const userRef = doc(db, 'users', userId);
      
      await setDoc(userRef, {
        photoURL: dataUrl,
        updated_at: new Date().toISOString()
      }, { merge: true });

      console.log('Foto salva no Firestore com sucesso');

      return NextResponse.json({
        success: true,
        url: dataUrl,
        fileName: file.name
      });
    } else {
      console.error('Firestore não disponível');
      return NextResponse.json(
        { error: 'Serviço temporariamente indisponível' },
        { status: 503 }
      );
    }

  } catch (error: any) {
    console.error('=== ERRO NO UPLOAD SIMPLIFICADO ===');
    console.error('Erro completo:', error);
    console.error('Mensagem do erro:', error.message);
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 