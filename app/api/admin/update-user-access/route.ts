import { NextRequest, NextResponse } from 'next/server'
import { updateUser, getUserData, getCourseById } from '@/lib/firebase'

export async function POST(request: NextRequest) {
  try {
    console.log('📥 API /admin/update-user-access chamada')
    
    const { userId, courseName, isPaid = true } = await request.json()
    console.log('📋 Dados recebidos:', { userId, courseName, isPaid })

    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar dados do usuário
    const userData = await getUserData(userId)
    if (!userData) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Buscar o ID do curso pelo nome
    let selectedCourseId = ''
    if (courseName) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/courses`)
        if (response.ok) {
          const courses = await response.json()
          const course = courses.find((c: any) => c.name === courseName)
          if (course) {
            selectedCourseId = course.id
            console.log('✅ Curso encontrado:', course.name, 'ID:', selectedCourseId)
          } else {
            // Tentar buscar por similaridade
            const similarCourse = courses.find((c: any) => 
              c.name.toLowerCase().includes(courseName.toLowerCase()) ||
              courseName.toLowerCase().includes(c.name.toLowerCase())
            )
            if (similarCourse) {
              selectedCourseId = similarCourse.id
              console.log('✅ Curso similar encontrado:', similarCourse.name, 'ID:', selectedCourseId)
            } else {
              console.log('❌ Curso não encontrado:', courseName)
            }
          }
        }
      } catch (error) {
        console.error('❌ Erro ao buscar curso:', error)
      }
    }

    // Atualizar usuário
    const updateData: any = {
      isPaid: isPaid,
      createdByAdmin: true
    }

    if (selectedCourseId) {
      updateData.selectedCourse = selectedCourseId
    }

    console.log('🔄 Atualizando usuário:', userId, updateData)
    await updateUser(userId, updateData)

    console.log('✅ Usuário atualizado com sucesso')

    return NextResponse.json({
      success: true,
      message: 'Acesso do usuário atualizado com sucesso!',
      user: { uid: userId, ...updateData }
    })

  } catch (error) {
    console.error('❌ Erro ao atualizar acesso do usuário:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 