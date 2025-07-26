import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/firebase'
import { collection, addDoc, setDoc, doc } from 'firebase/firestore'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name = 'Usuário Teste' } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email não fornecido' },
        { status: 400 }
      )
    }

    console.log('=== FORÇAR APROVAÇÃO ===')
    console.log('Email:', email)

    if (!db) {
      console.log('ERRO: Firebase não inicializado')
      return NextResponse.json(
        { error: 'Firebase não inicializado' },
        { status: 500 }
      )
    }

    // Criar usuário com acesso pago
    const userId = email.replace(/[^a-zA-Z0-9]/g, '_')
    const userRef = doc(db, 'users', userId)
    
    await setDoc(userRef, {
      email,
      name,
      uid: userId,
      isPaid: true,
      hasAccess: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    })

    // Criar pagamento aprovado
    const paymentRef = doc(db, 'payments', `payment_${userId}`)
    await setDoc(paymentRef, {
      email,
      uid: userId,
      payment_id: `test_${Date.now()}`,
      amount: 99.90,
      status: 'approved',
      method: 'admin',
      created_at: new Date().toISOString()
    })

    console.log('✅ Usuário aprovado com sucesso')

    return NextResponse.json({
      success: true,
      message: 'Usuário aprovado com sucesso',
      email,
      userId
    })

  } catch (error: any) {
    console.error('❌ Erro ao aprovar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 