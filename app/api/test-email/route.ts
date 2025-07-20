import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function GET(request: NextRequest) {
  try {
    console.log('=== TESTE DE EMAIL ===')
    console.log('EMAIL_USER:', process.env.EMAIL_USER)
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***CONFIGURADO***' : 'NÃO CONFIGURADO')
    console.log('NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL)

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return NextResponse.json({
        error: 'Variáveis de email não configuradas',
        emailUser: !!process.env.EMAIL_USER,
        emailPass: !!process.env.EMAIL_PASS
      })
    }

    // Testar configuração do transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })

    // Verificar se a configuração está correta
    await transporter.verify()
    console.log('Transporter verificado com sucesso')

    // Enviar email de teste
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'flashconcards@gmail.com', // Email de teste
      subject: '🧪 Teste de Email - FlashConCards',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1>🧪 Teste de Email</h1>
          <p>Este é um email de teste para verificar se o sistema está funcionando.</p>
          <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
          <p><strong>Status:</strong> ✅ Sistema de email funcionando!</p>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)
    console.log('Email de teste enviado com sucesso')

    return NextResponse.json({
      success: true,
      message: 'Sistema de email funcionando corretamente',
      emailUser: process.env.EMAIL_USER,
      emailPassConfigured: !!process.env.EMAIL_PASS
    })

  } catch (error: any) {
    console.error('Erro no teste de email:', error)
    return NextResponse.json({
      error: 'Erro no sistema de email',
      details: error.message,
      emailUser: !!process.env.EMAIL_USER,
      emailPassConfigured: !!process.env.EMAIL_PASS
    }, { status: 500 })
  }
} 