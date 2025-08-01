import { NextRequest, NextResponse } from 'next/server'
import { sendGmailDirectAdminEmail } from '@/lib/email-gmail-direct'

export async function POST(request: NextRequest) {
  try {
    const { displayName, email, courseName, password } = await request.json()

    // Validar dados obrigatórios
    if (!displayName || !email) {
      return NextResponse.json(
        { error: 'Nome e email são obrigatórios' },
        { status: 400 }
      )
    }

    // Aqui você implementaria a criação real no Firebase
    // Por enquanto, vamos simular
    const userData = {
      uid: Date.now().toString(),
      displayName,
      email,
      photoURL: '',
      isPaid: false,
      isActive: true,
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      studyTime: 0,
      cardsStudied: 0,
      cardsCorrect: 0,
      cardsWrong: 0,
    }

    // Enviar email de boas-vindas
    try {
      await sendGmailDirectAdminEmail({
        userName: displayName,
        userEmail: email,
        courseName: courseName || 'Curso Padrão',
        userPassword: password || '123456'
      })

      return NextResponse.json({
        success: true,
        message: 'Usuário adicionado e email enviado com sucesso!',
        user: userData
      })

    } catch (emailError) {
      console.error('Erro ao enviar email:', emailError)
      
      return NextResponse.json({
        success: true,
        message: 'Usuário adicionado, mas erro ao enviar email',
        user: userData,
        emailError: emailError instanceof Error ? emailError.message : 'Erro desconhecido'
      })
    }

  } catch (error) {
    console.error('Erro ao adicionar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 