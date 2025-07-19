import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, paymentId, amount } = body

    if (!email || !name || !paymentId) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    // Configurar transporter do nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Seu email Gmail
        pass: process.env.EMAIL_PASS  // Sua senha de app do Gmail
      }
    })

    // Template do email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '🎉 Compra Confirmada - FlashConCards',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🎉 Compra Confirmada!</h1>
            <p style="margin: 10px 0; font-size: 18px;">Olá, ${name}!</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">✅ Sua compra foi processada com sucesso!</h2>
            
            <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2d5a2d; margin: 0 0 10px 0;">📋 Detalhes da Compra:</h3>
              <p style="margin: 5px 0; color: #333;"><strong>Produto:</strong> FlashConCards - Curso Completo</p>
              <p style="margin: 5px 0; color: #333;"><strong>Valor:</strong> R$ ${amount || '99,90'}</p>
              <p style="margin: 5px 0; color: #333;"><strong>ID da Transação:</strong> ${paymentId}</p>
              <p style="margin: 5px 0; color: #333;"><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
            </div>
            
            <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e3a8a; margin: 0 0 15px 0;">🚀 O que você ganha:</h3>
              <ul style="color: #333; line-height: 1.6;">
                <li>✅ Acesso completo a 150+ flashcards</li>
                <li>✅ 6 matérias do edital ALEGO</li>
                <li>✅ Sistema de progresso inteligente</li>
                <li>✅ Acesso 24/7 de qualquer dispositivo</li>
                <li>✅ Suporte completo</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://flashconcards.vercel.app'}/login" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                🎯 COMEÇAR A ESTUDAR AGORA
              </a>
            </div>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>💡 Dica:</strong> Use a senha <strong>souflashconcards</strong> para fazer login no sistema.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 14px;">
            <p>Se você tiver alguma dúvida, entre em contato conosco.</p>
            <p>© 2024 FlashConCards. Todos os direitos reservados.</p>
          </div>
        </div>
      `
    }

    // Enviar email
    await transporter.sendMail(mailOptions)

    return NextResponse.json({
      success: true,
      message: 'Email de confirmação enviado com sucesso'
    })
  } catch (error: any) {
    console.error('Erro ao enviar email:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 