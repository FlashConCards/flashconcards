import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore'

// Configurar Mercado Pago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '' 
})

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    if (data.type === 'payment') {
      const paymentId = data.data.id
      
      // Buscar informações do pagamento no Mercado Pago
      const payment = new Payment(client)
      const paymentInfo = await payment.get({ id: paymentId })

      if (paymentInfo.status === 'approved') {
        // Buscar pagamento no Firestore
        const paymentsRef = collection(db, 'payments')
        const q = query(paymentsRef, where('mercadopagoId', '==', paymentId.toString()))
        const querySnapshot = await getDocs(q)
        
        if (!querySnapshot.empty) {
          const paymentDoc = querySnapshot.docs[0]
          const paymentData = paymentDoc.data()
          
          // Atualizar status do pagamento
          await updateDoc(doc(db, 'payments', paymentDoc.id), {
            status: 'approved',
            updatedAt: new Date(),
          })
          
          // Atualizar status do usuário
          await updateDoc(doc(db, 'users', paymentData.userId), {
            isPaid: true,
            updatedAt: new Date(),
          })
          
          console.log(`Pagamento ${paymentId} aprovado para usuário ${paymentData.userId}`)
        }
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro no webhook:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao processar webhook' },
      { status: 500 }
    )
  }
} 