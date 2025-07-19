import { NextRequest, NextResponse } from 'next/server'
import { getPaymentStatus } from '@/app/lib/mercadopago'
import { isUserPaid } from '@/app/lib/payments'

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
        status_detail: result.status_detail,
        external_reference: result.external_reference
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

    console.log('Verificando pagamento para email:', email)

    // PRIMEIRO: Verificar status real no Mercado Pago
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
    
    if (!querySnapshot.empty) {
      const payment = querySnapshot.docs[0].data()
      const paymentId = payment.payment_id
      
      console.log('Verificando status real do pagamento:', paymentId)
      
      // Verificar status real no Mercado Pago
      const result = await getPaymentStatus(paymentId)
      
      if (result.success) {
        const realStatus = result.status
        console.log('Status real do pagamento:', realStatus)
        
        // Se foi aprovado, atualizar no Firebase
        if (realStatus === 'approved') {
          const { updatePaymentStatus } = await import('@/app/lib/firebase')
          await updatePaymentStatus(paymentId, 'approved')
          console.log('Pagamento aprovado no Firebase')
        }
        
        return NextResponse.json({
          success: true,
          isPaid: realStatus === 'approved',
          email,
          realStatus
        })
      }
    }

    // SEGUNDO: Verificar se o usuário pagou (fallback)
    const isPaid = await isUserPaid(email)
    
    console.log('Resultado da verificação:', { email, isPaid })

    return NextResponse.json({
      success: true,
      isPaid,
      email
    })
  } catch (error: any) {
    console.error('Erro ao verificar pagamento por email:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 