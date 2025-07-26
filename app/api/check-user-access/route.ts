import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'

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

    console.log('=== VERIFICAÇÃO DE ACESSO ===')
    console.log('Email:', email)

    if (!db) {
      console.log('ERRO: Firebase não inicializado')
      return NextResponse.json(
        { error: 'Firebase não inicializado' },
        { status: 500 }
      )
    }

    // Verificar se o usuário existe na coleção 'users'
    const usersQuery = query(collection(db, 'users'), where('email', '==', email))
    const usersSnapshot = await getDocs(usersQuery)
    
    if (!usersSnapshot.empty) {
      const userData = usersSnapshot.docs[0].data()
      console.log('Usuário encontrado:', userData)
      
      // Se o usuário existe e tem acesso pago
      if (userData.isPaid || userData.hasAccess) {
        console.log('✅ Usuário tem acesso pago')
        return NextResponse.json({
          success: true,
          hasAccess: true,
          email,
          userData
        })
      }
    }

    // Verificar se há pagamento aprovado na coleção 'payments'
    const paymentsQuery = query(collection(db, 'payments'), where('email', '==', email))
    const paymentsSnapshot = await getDocs(paymentsQuery)
    
    if (!paymentsSnapshot.empty) {
      const paymentData = paymentsSnapshot.docs[0].data()
      console.log('Pagamento encontrado:', paymentData)
      
      // Se o pagamento foi aprovado
      if (paymentData.status === 'approved') {
        console.log('✅ Pagamento aprovado')
        return NextResponse.json({
          success: true,
          hasAccess: true,
          email,
          paymentData
        })
      }
    }

    // Se chegou até aqui, usuário não tem acesso
    console.log('❌ Usuário não tem acesso')
    return NextResponse.json({
      success: true,
      hasAccess: false,
      email
    })

  } catch (error: any) {
    console.error('❌ Erro ao verificar acesso:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 