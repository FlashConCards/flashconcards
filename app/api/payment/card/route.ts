import { NextRequest, NextResponse } from 'next/server'
import { createCardPayment, getPaymentStatus } from '@/app/lib/mercadopago'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      email, 
      firstName, 
      lastName, 
      token, 
      paymentMethodId, 
      installments = 1,
      issuerId 
    } = body

    if (!email || !firstName || !lastName || !token || !paymentMethodId) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    const paymentData = {
      transaction_amount: 1.00,
      description: 'FlashConCards ALEGO - Teste R$ 1,00',
      payment_method_id: paymentMethodId,
      token,
      installments: parseInt(installments),
      issuer_id: issuerId,
      payer: {
        email,
        first_name: firstName,
        last_name: lastName
      }
    }

    const result = await createCardPayment(paymentData)

    if (result.success) {
      console.log('✅ Pagamento criado com sucesso:', result.payment_id)
      
      // Salvar pagamento no Firebase
      try {
        const { db } = await import('@/app/lib/firebase')
        const { collection, addDoc } = await import('firebase/firestore')
        
        if (db) {
          await addDoc(collection(db, 'payments'), {
            payment_id: result.payment_id?.toString(),
            email,
            first_name: firstName,
            last_name: lastName,
            amount: 1.00,
            status: result.status || 'pending',
            created_at: new Date().toISOString(),
            payment_method: 'card'
          })
          
          console.log('✅ Pagamento salvo no Firebase')
        }
      } catch (firebaseError) {
        console.error('❌ Erro ao salvar no Firebase:', firebaseError)
      }

      // Verificar status imediatamente e enviar email se aprovado
      if (result.payment_id) {
        console.log('🔍 Verificando status do pagamento...')
        
        // Aguardar 3 segundos para o pagamento ser processado
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        const statusResult = await getPaymentStatus(result.payment_id.toString())
        console.log('Status verificado:', statusResult)
        
        if (statusResult.success && statusResult.status === 'approved') {
          console.log('✅ PAGAMENTO APROVADO - Enviando email...')
          
          try {
            const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://flashconcards.vercel.app'}/api/email/send-confirmation`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email,
                name: firstName,
                paymentId: result.payment_id.toString(),
                amount: '1,00'
              })
            })
            
            if (emailResponse.ok) {
              const emailResult = await emailResponse.json()
              console.log('✅ Email enviado com sucesso:', emailResult)
            } else {
              const errorText = await emailResponse.text()
              console.error('❌ Erro ao enviar email:', errorText)
            }
          } catch (emailError) {
            console.error('❌ Erro ao enviar email:', emailError)
          }
        } else {
          console.log('⏳ Pagamento ainda não aprovado. Status:', statusResult.status)
        }
      }
      
      return NextResponse.json({
        success: true,
        payment_id: result.payment_id,
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
    console.error('Erro ao processar pagamento com cartão:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 