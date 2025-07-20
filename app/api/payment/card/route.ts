import { NextRequest, NextResponse } from 'next/server'
import { createCardPayment } from '@/app/lib/mercadopago'

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