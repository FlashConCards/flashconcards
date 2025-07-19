import { NextRequest, NextResponse } from 'next/server'
import { getPaymentStatus } from '@/app/lib/mercadopago'
import { updatePaymentStatus } from '@/app/lib/firebase'

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

    // Buscar pagamento pelo email no Firebase
    const { db } = await import('@/app/lib/firebase')
    const { collection, query, where, getDocs } = await import('firebase/firestore')
    
    if (!db) {
      return NextResponse.json(
        { error: 'Firebase não inicializado' },
        { status: 500 }
      )
    }

    // Buscar pagamento pelo email
    const q = query(collection(db, 'payments'), where('email', '==', email))
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: 'Nenhum pagamento encontrado para este email' },
        { status: 404 }
      )
    }

    // Verificar status real no Mercado Pago
    const payment = querySnapshot.docs[0].data()
    const paymentId = payment.payment_id
    
    console.log('Verificando status real do pagamento:', paymentId)
    
    const result = await getPaymentStatus(paymentId)
    
    if (result.success) {
      // Atualizar status no Firebase baseado no status real
      const realStatus = result.status
      console.log('Status real do pagamento:', realStatus)
      
      // Se foi aprovado, atualizar no Firebase
      if (realStatus === 'approved') {
        await updatePaymentStatus(paymentId, 'approved')
        console.log('Pagamento aprovado no Firebase')
      }
      
      return NextResponse.json({
        success: true,
        realStatus,
        isPaid: realStatus === 'approved',
        paymentId
      })
    } else {
      return NextResponse.json(
        { error: 'Erro ao verificar status no Mercado Pago' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Erro ao verificar status real:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 