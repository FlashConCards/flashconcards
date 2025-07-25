import { NextRequest, NextResponse } from 'next/server'
import { getPaymentStatus } from '@/app/lib/mercadopago'
import { isUserPaid } from '@/app/lib/payments'
import { db } from '@/app/lib/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const paymentId = searchParams.get('payment_id')

    if (!paymentId) {
      return NextResponse.json(
        { error: 'ID do pagamento não fornecido' },
        { status: 400 }
      )
    }

    const result = await getPaymentStatus(paymentId)

    if (result.success) {
      return NextResponse.json({
        success: true,
        status: result.status,
        status_detail: result.status_detail
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Erro ao verificar status do pagamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

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

    // Verificar se o usuário existe na coleção de pagamentos
    const paymentsRef = collection(db, 'payments')
    const q = query(paymentsRef, where('email', '==', email))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      // Usuário tem pagamento registrado
      const paymentDoc = querySnapshot.docs[0]
      const paymentData = paymentDoc.data()
      
      // Verificar se o pagamento foi aprovado
      if (paymentData.status === 'approved' || paymentData.status === 'pending') {
        return NextResponse.json({
          success: true,
          isPaid: true,
          paymentData
        })
      }
    }

    // Verificar se o usuário existe na coleção de usuários
    const usersRef = collection(db, 'users')
    const userQuery = query(usersRef, where('email', '==', email))
    const userSnapshot = await getDocs(userQuery)

    if (!userSnapshot.empty) {
      const userDoc = userSnapshot.docs[0]
      const userData = userDoc.data()
      
      // Verificar se o usuário tem acesso pago
      if (userData.isPaid || userData.hasAccess) {
        return NextResponse.json({
          success: true,
          isPaid: true,
          userData
        })
      }
    }

    // Se chegou até aqui, usuário não tem acesso
    return NextResponse.json({
      success: true,
      isPaid: false
    })

  } catch (error: any) {
    console.error('Erro ao verificar status do pagamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 