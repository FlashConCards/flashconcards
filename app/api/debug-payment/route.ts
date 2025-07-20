import { NextRequest, NextResponse } from 'next/server'
import { getPaymentStatus } from '@/app/lib/mercadopago'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    console.log('=== DEBUG PAGAMENTO ===')
    console.log('Email:', email)

    // Verificar Firebase
    const { db } = await import('@/app/lib/firebase')
    const { collection, query, where, getDocs } = await import('firebase/firestore')
    
    if (!db) {
      return NextResponse.json({ error: 'Firebase não inicializado' })
    }

    // Buscar pagamento
    const q = query(collection(db, 'payments'), where('email', '==', email))
    const querySnapshot = await getDocs(q)
    
    console.log('Pagamentos encontrados:', querySnapshot.size)
    
    if (!querySnapshot.empty) {
      const payment = querySnapshot.docs[0].data()
      const paymentId = payment.payment_id
      
      console.log('Payment ID:', paymentId)
      console.log('Dados do pagamento:', payment)
      
      // Verificar status no Mercado Pago
      const result = await getPaymentStatus(paymentId)
      
      console.log('Resultado Mercado Pago:', result)
      
      if (result.success) {
        console.log('Status real:', result.status)
        
        // Testar envio de email diretamente
        if (result.status === 'approved') {
          console.log('✅ PAGAMENTO APROVADO - Testando email...')
          
          try {
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
            
            console.log('Status da resposta do email:', emailResponse.status)
            
            if (emailResponse.ok) {
              const emailResult = await emailResponse.json()
              console.log('✅ Email enviado com sucesso:', emailResult)
            } else {
              const errorText = await emailResponse.text()
              console.log('❌ Erro no email:', errorText)
            }
          } catch (emailError) {
            console.log('❌ Erro ao enviar email:', emailError)
          }
        }
      }
      
      return NextResponse.json({
        success: true,
        paymentFound: true,
        paymentId,
        paymentData: payment,
        mercadoPagoResult: result,
        emailUser: process.env.EMAIL_USER,
        emailPassConfigured: !!process.env.EMAIL_PASS,
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL
      })
    } else {
      console.log('❌ Nenhum pagamento encontrado')
      return NextResponse.json({
        success: false,
        paymentFound: false,
        email
      })
    }
    
  } catch (error: any) {
    console.error('❌ Erro no debug:', error)
    return NextResponse.json({
      error: error.message
    }, { status: 500 })
  }
} 