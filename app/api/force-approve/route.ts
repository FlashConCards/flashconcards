import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    console.log('=== FORÇAR APROVAÇÃO ===')
    console.log('Email:', email)

    // Verificar Firebase
    const { db } = await import('@/app/lib/firebase')
    const { collection, query, where, getDocs, updateDoc, doc } = await import('firebase/firestore')
    
    if (!db) {
      return NextResponse.json({ error: 'Firebase não inicializado' })
    }

    // Buscar pagamento
    const q = query(collection(db, 'payments'), where('email', '==', email))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const paymentDoc = querySnapshot.docs[0]
      const payment = paymentDoc.data()
      const paymentId = payment.payment_id
      
      console.log('Payment ID:', paymentId)
      
      // Forçar status para approved
      await updateDoc(doc(db, 'payments', paymentDoc.id), {
        status: 'approved'
      })
      
      console.log('✅ Status forçado para approved')
      
      // Enviar email de confirmação
      try {
        console.log('Enviando email para:', email)
        
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
      
      return NextResponse.json({
        success: true,
        message: 'Pagamento forçado para approved e email enviado',
        email
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Nenhum pagamento encontrado',
        email
      })
    }
    
  } catch (error: any) {
    console.error('❌ Erro ao forçar aprovação:', error)
    return NextResponse.json({
      error: error.message
    }, { status: 500 })
  }
} 