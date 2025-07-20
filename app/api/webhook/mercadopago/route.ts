import { NextRequest, NextResponse } from 'next/server'
import { getPaymentStatus } from '@/app/lib/mercadopago'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('=== WEBHOOK MERCADO PAGO ===')
    console.log('Dados recebidos:', body)

    // Verificar se é um evento de pagamento
    if (body.type === 'payment' && body.data?.id) {
      const paymentId = body.data.id
      console.log('Payment ID do webhook:', paymentId)

      // Verificar status do pagamento
      const result = await getPaymentStatus(paymentId.toString())
      console.log('Status do pagamento:', result)

      if (result.success && result.status === 'approved') {
        console.log('✅ PAGAMENTO APROVADO VIA WEBHOOK!')

        // Buscar dados do pagamento no Firebase
        const { db } = await import('@/app/lib/firebase')
        const { collection, query, where, getDocs } = await import('firebase/firestore')
        
        if (db) {
          const q = query(collection(db, 'payments'), where('payment_id', '==', paymentId.toString()))
          const querySnapshot = await getDocs(q)
          
          if (!querySnapshot.empty) {
            const payment = querySnapshot.docs[0].data()
            const email = payment.email
            const name = payment.first_name || 'Usuário'
            
            console.log('Enviando email para:', email)
            
            // Enviar email de confirmação
            try {
              const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://flashconcards.vercel.app'}/api/email/send-confirmation`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  email,
                  name,
                  paymentId: paymentId.toString(),
                  amount: payment.amount || '99,90'
                })
              })
              
              if (emailResponse.ok) {
                const emailResult = await emailResponse.json()
                console.log('✅ Email enviado com sucesso via webhook:', emailResult)
              } else {
                const errorText = await emailResponse.text()
                console.error('❌ Erro ao enviar email via webhook:', errorText)
              }
            } catch (emailError) {
              console.error('❌ Erro ao enviar email via webhook:', emailError)
            }
          } else {
            console.log('❌ Pagamento não encontrado no Firebase')
          }
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('❌ Erro no webhook:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 