import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, content, rating } = body;

    // Verificar se o usuário está autenticado
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token de autenticação necessário' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    let user;
    
    try {
      user = await auth.verifyIdToken(token);
    } catch (error) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Verificar se o usuário tem acesso ativo
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid)));
    
    if (userDoc.empty) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const userData = userDoc.docs[0].data();
    if (!userData.isPaid && !userData.isAdmin && !userData.createdByAdmin) {
      return NextResponse.json({ error: 'Acesso ativo necessário para enviar depoimentos' }, { status: 403 });
    }

    // Validar dados do depoimento
    if (!name || !content || !rating) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Avaliação deve ser entre 1 e 5' }, { status: 400 });
    }

    if (content.length < 10) {
      return NextResponse.json({ error: 'Depoimento deve ter pelo menos 10 caracteres' }, { status: 400 });
    }

    // Verificar se o usuário já enviou um depoimento
    const existingTestimonial = await getDocs(
      query(
        collection(db, 'testimonials'),
        where('userId', '==', user.uid),
        where('status', 'in', ['pending', 'approved'])
      )
    );

    if (!existingTestimonial.empty) {
      return NextResponse.json({ error: 'Você já enviou um depoimento' }, { status: 400 });
    }

    // Criar o depoimento
    const testimonialData = {
      name: userData.displayName || name,
      content,
      rating,
      userId: user.uid,
      userEmail: userData.email,
      status: 'pending',
      createdAt: new Date()
    };

    const docRef = await addDoc(collection(db, 'testimonials'), testimonialData);

    return NextResponse.json({ 
      success: true, 
      message: 'Depoimento enviado com sucesso! Aguardando aprovação.',
      id: docRef.id 
    });

  } catch (error) {
    console.error('Erro ao criar depoimento:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'approved';

    // Buscar depoimentos
    const testimonialsQuery = query(
      collection(db, 'testimonials'),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(testimonialsQuery);
    const testimonials = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json(testimonials);

  } catch (error) {
    console.error('Erro ao buscar depoimentos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    // Verificar se o usuário é admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token de autenticação necessário' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    let user;
    
    try {
      user = await auth.verifyIdToken(token);
    } catch (error) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Verificar se o usuário é admin
    const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid)));
    
    if (userDoc.empty) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const userData = userDoc.docs[0].data();
    if (!userData.isAdmin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Atualizar status do depoimento
    const testimonialRef = doc(db, 'testimonials', id);
    await updateDoc(testimonialRef, {
      status,
      updatedAt: new Date(),
      updatedBy: user.uid
    });

    return NextResponse.json({ 
      success: true, 
      message: `Depoimento ${status === 'approved' ? 'aprovado' : 'rejeitado'} com sucesso` 
    });

  } catch (error) {
    console.error('Erro ao atualizar depoimento:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID do depoimento é obrigatório' }, { status: 400 });
    }

    // Verificar se o usuário é admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token de autenticação necessário' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    let user;
    
    try {
      user = await auth.verifyIdToken(token);
    } catch (error) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Verificar se o usuário é admin
    const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid)));
    
    if (userDoc.empty) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const userData = userDoc.docs[0].data();
    if (!userData.isAdmin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Excluir o depoimento
    const testimonialRef = doc(db, 'testimonials', id);
    await deleteDoc(testimonialRef);

    return NextResponse.json({ 
      success: true, 
      message: 'Depoimento excluído com sucesso' 
    });

  } catch (error) {
    console.error('Erro ao excluir depoimento:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 