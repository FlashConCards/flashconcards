import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { sendGmailDirectEmail } from '@/lib/email-gmail-direct'
import { getCourseById, getUserById } from '@/lib/firebase'

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
        console.log(`✅ Pagamento ${paymentId} aprovado`)
        
        // Extrair informações do pagamento
        const externalReference = paymentInfo.external_reference
        const [userId, courseId] = externalReference.split('_')
        
        if (userId && courseId) {
          try {
            // Buscar informações do usuário e curso
            const user = await getUserById(userId)
            const course = await getCourseById(courseId)
            
            if (user && course) {
              // Enviar email de boas-vindas automaticamente
              await sendGmailDirectEmail({
                userName: user.displayName,
                userEmail: user.email,
                courseName: course.name,
                accessExpiryDate: user.accessExpiryDate
              })
              
              console.log(`📧 Email de boas-vindas enviado para: ${user.email}`)
            }
          } catch (emailError) {
            console.error('❌ Erro ao enviar email de boas-vindas:', emailError)
            // Não falhar o webhook se o email falhar
          }
        }
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Erro no webhook:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao processar webhook' },
      { status: 500 }
    )
  }
} 