import { NextRequest, NextResponse } from 'next/server'
import { sendGmailDirectAdminEmail } from '@/lib/email-gmail-direct'

export async function POST(request: NextRequest) {
  try {
    console.log('📥 API /admin/send-welcome-email chamada')
    
    const { userName, userEmail, courseName, userPassword } = await request.json()
    console.log('📋 Dados recebidos:', { userName, userEmail, courseName, userPassword })

    // Validar dados obrigatórios
    if (!userName || !userEmail || !courseName) {
      console.log('❌ Dados obrigatórios faltando')
      return NextResponse.json(
        { error: 'Nome, email e curso são obrigatórios' },
        { status: 400 }
      )
    }

    // Enviar email de boas-vindas
    try {
      console.log('📧 Iniciando envio de email...')
      
      await sendGmailDirectAdminEmail({
        userName,
        userEmail,
        courseName,
        userPassword: userPassword || '123456'
      })

      console.log('✅ Email enviado com sucesso')

      return NextResponse.json({
        success: true,
        message: 'Email de boas-vindas enviado com sucesso!'
      })

    } catch (emailError) {
      console.error('❌ Erro ao enviar email:', emailError)
      
      return NextResponse.json({
        success: false,
        error: 'Erro ao enviar email',
        details: emailError instanceof Error ? emailError.message : 'Erro desconhecido'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Erro ao processar requisição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 