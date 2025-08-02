import { NextRequest, NextResponse } from 'next/server'
import { sendGmailDirectAdminEmail } from '@/lib/email-gmail-direct'
import { createUserByAdmin, getCourses } from '@/lib/firebase'

export async function POST(request: NextRequest) {
  try {
    console.log('📥 API /admin/test-add-user chamada')
    
    const { displayName, email, courseName, password } = await request.json()
    console.log('📋 Dados recebidos:', { displayName, email, courseName, password })

    // Validar dados obrigatórios
    if (!displayName || !email) {
      console.log('❌ Dados obrigatórios faltando')
      return NextResponse.json(
        { error: 'Nome e email são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar o ID do curso pelo nome diretamente do Firebase
    let selectedCourseId = ''
    if (courseName) {
      try {
        console.log('🔍 Buscando curso:', courseName)
        const allCourses = await getCourses()
        console.log('📚 Cursos disponíveis:', allCourses.length)
        
        const course = allCourses.find((c: any) => c.name === courseName)
        if (course) {
          selectedCourseId = course.id
          console.log('✅ Curso encontrado:', course.name, 'ID:', selectedCourseId)
        } else {
          console.log('⚠️ Curso não encontrado:', courseName)
          // Se não encontrar pelo nome exato, tentar buscar por similaridade
          const similarCourse = allCourses.find((c: any) => 
            c.name.toLowerCase().includes(courseName.toLowerCase()) ||
            courseName.toLowerCase().includes(c.name.toLowerCase())
          )
          if (similarCourse) {
            selectedCourseId = similarCourse.id
            console.log('✅ Curso similar encontrado:', similarCourse.name, 'ID:', selectedCourseId)
          }
        }
      } catch (error) {
        console.error('❌ Erro ao buscar curso:', error)
      }
    }

    // Criar usuário no Firebase
    const userData = {
      displayName,
      email,
      password: password || '123456',
      isPaid: true, // Usuários criados pelo admin têm acesso pago
      isActive: true,
      isAdmin: false,
      selectedCourse: selectedCourseId, // ID do curso selecionado
      studyTime: 0,
      cardsStudied: 0,
      cardsCorrect: 0,
      cardsWrong: 0,
    }

    console.log('👤 Criando usuário no Firebase:', userData)

    // Criar usuário usando a função do Firebase
    const userId = await createUserByAdmin(userData)
    console.log('✅ Usuário criado com sucesso:', userId)

    // Enviar email de boas-vindas
    try {
      console.log('📧 Iniciando envio de email...')
      
      await sendGmailDirectAdminEmail({
        userName: displayName,
        userEmail: email,
        courseName: courseName || 'Curso Padrão',
        userPassword: password || '123456'
      })

      console.log('✅ Email enviado com sucesso')

      return NextResponse.json({
        success: true,
        message: 'Usuário adicionado e email enviado com sucesso!',
        user: { uid: userId, ...userData }
      })

    } catch (emailError) {
      console.error('❌ Erro ao enviar email:', emailError)
      
      return NextResponse.json({
        success: true,
        message: 'Usuário adicionado, mas erro ao enviar email',
        user: { uid: userId, ...userData },
        emailError: emailError instanceof Error ? emailError.message : 'Erro desconhecido'
      })
    }

  } catch (error) {
    console.error('❌ Erro ao adicionar usuário:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 