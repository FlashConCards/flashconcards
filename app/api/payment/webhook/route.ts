import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { sendGmailDirectEmail } from '@/lib/email-gmail-direct'
import { getCourseById, getUserById, updateUser, calculateAccessExpiry } from '@/lib/firebase'

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
        
        if (externalReference) {
          const [userId, courseId] = externalReference.split('_')
          
          if (userId && courseId) {
            try {
              // Buscar informações do usuário e curso
              const user = await getUserById(userId) as any
              const course = await getCourseById(courseId) as any
              
              if (user && course) {
                // Calcular data de expiração do acesso (6 meses por padrão)
                const expirationMonths = course.expirationMonths || 6
                const accessExpiryDate = calculateAccessExpiry(expirationMonths)
                
                // Atualizar status do usuário no Firebase
                await updateUser(userId, {
                  isPaid: true,
                  selectedCourse: courseId,
                  courseAccessExpiry: accessExpiryDate,
                  paymentDate: new Date(),
                  lastPaymentId: paymentId
                })
                
                console.log(`✅ Usuário ${userId} atualizado com acesso ao curso ${courseId}`)
                
                // Enviar email de boas-vindas automaticamente
                await sendGmailDirectEmail({
                  userName: user.displayName || 'Usuário',
                  userEmail: user.email || '',
                  courseName: course.name || 'Curso',
                  accessExpiryDate: accessExpiryDate.toLocaleDateString('pt-BR')
                })
                
                console.log(`📧 Email de boas-vindas enviado para: ${user.email}`)
              }
            } catch (error) {
              console.error('❌ Erro ao processar pagamento aprovado:', error)
              // Não falhar o webhook se houver erro
            }
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