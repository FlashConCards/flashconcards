import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email não fornecido' },
        { status: 400 }
      )
    }

    // Verificar se o usuário existe na coleção users (criado pelo admin)
    const { db } = await import('@/app/lib/firebase')
    const { collection, query, where, getDocs } = await import('firebase/firestore')
    
    if (!db) {
      console.log('ERRO: Firebase não inicializado')
      return NextResponse.json(
        { error: 'Firebase não inicializado' },
        { status: 500 }
      )
    }

    // Buscar usuário pelo email na coleção users
    const q = query(collection(db, 'users'), where('email', '==', email))
    const querySnapshot = await getDocs(q)
    
    console.log('Verificando usuário admin:', email, 'Encontrado:', !querySnapshot.empty)
    
    return NextResponse.json({
      success: true,
      exists: !querySnapshot.empty,
      email
    })
  } catch (error: any) {
    console.error('❌ Erro ao verificar usuário admin:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 