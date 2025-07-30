import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'

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
        // Mock: Processar pagamento aprovado (temporário para deploy)
        console.log(`Pagamento ${paymentId} aprovado (mock)`)
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