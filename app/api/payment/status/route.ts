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

    console.log('=== VERIFICAÇÃO DE PAGAMENTO ===')
    console.log('Email:', email)

    // PRIMEIRO: Verificar status real no Mercado Pago
    const { db } = await import('@/app/lib/firebase')
    const { collection, query, where, getDocs } = await import('firebase/firestore')
    
    if (!db) {
      console.log('ERRO: Firebase não inicializado')
      return NextResponse.json(
        { error: 'Firebase não inicializado' },
        { status: 500 }
      )
    }

    // Buscar pagamento pelo email
    const q = query(collection(db, 'payments'), where('email', '==', email))
    const querySnapshot = await getDocs(q)
    
    console.log('Pagamentos encontrados:', querySnapshot.size)
    
    if (!querySnapshot.empty) {
      const payment = querySnapshot.docs[0].data()
      const paymentId = payment.payment_id
      
      console.log('Payment ID encontrado:', paymentId)
      console.log('Dados do pagamento:', payment)
      
      // Verificar status real no Mercado Pago
      const result = await getPaymentStatus(paymentId)
      
      if (result.success) {
        const realStatus = result.status
        console.log('Status real do pagamento:', realStatus)
        
        // Se foi aprovado, atualizar no Firebase e enviar email
        if (realStatus === 'approved') {
          console.log('✅ PAGAMENTO APROVADO - Enviando email...')
          
          const { updatePaymentStatus } = await import('@/app/lib/firebase')
          await updatePaymentStatus(paymentId, 'approved')
          console.log('Status atualizado no Firebase')
          
          // Enviar email de confirmação
          try {
            console.log('Enviando email para:', email)
            console.log('URL do site:', process.env.NEXT_PUBLIC_SITE_URL)
            
            const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://flashconcards.vercel.app'}/api/email/send-confirmation`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email,
                name: payment.first_name || 'Usuário',
                paymentId,
                amount: payment.amount || '99,90'
              })
            })
            
            console.log('Resposta do email:', emailResponse.status)
            
            if (emailResponse.ok) {
              const emailResult = await emailResponse.json()
              console.log('✅ Email de confirmação enviado com sucesso:', emailResult)
            } else {
              const errorText = await emailResponse.text()
              console.error('❌ Erro ao enviar email de confirmação:', errorText)
            }
          } catch (emailError) {
            console.error('❌ Erro ao enviar email:', emailError)
          }
        } else {
          console.log('❌ Pagamento não aprovado. Status:', realStatus)
        }
        
        return NextResponse.json({
          success: true,
          isPaid: realStatus === 'approved',
          email,
          realStatus,
          paymentId
        })
      } else {
        console.log('❌ Erro ao verificar status no Mercado Pago:', result.error)
      }
    } else {
      console.log('❌ Nenhum pagamento encontrado para o email:', email)
    }

    // SEGUNDO: Verificar se o usuário pagou (fallback)
    const isPaid = await isUserPaid(email)
    
    console.log('Resultado final da verificação:', { email, isPaid })

    return NextResponse.json({
      success: true,
      isPaid,
      email
    })
  } catch (error: any) {
    console.error('❌ Erro ao verificar pagamento por email:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 