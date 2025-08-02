import { NextRequest, NextResponse } from 'next/server'
import { getUserData, getCoursesWithAccess, getCourses } from '@/lib/firebase'

export async function POST(request: NextRequest) {
  try {
    console.log('📥 API /admin/check-user-access chamada')
    
    const { userId } = await request.json()
    console.log('📋 Verificando acesso para usuário:', userId)

    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar dados do usuário
    const userData = await getUserData(userId)
    console.log('👤 Dados do usuário:', userData)

    // Buscar cursos disponíveis
    const allCourses = await getCourses()
    console.log('📚 Todos os cursos:', allCourses.length)

    // Buscar cursos com acesso do usuário
    const accessibleCourses = await getCoursesWithAccess(userId)
    console.log('🔓 Cursos acessíveis:', accessibleCourses.length)

    return NextResponse.json({
      success: true,
      user: userData,
      allCourses: allCourses,
      accessibleCourses: accessibleCourses,
      userHasAccess: accessibleCourses.length > 0,
      userIsPaid: userData?.isPaid || false,
      userIsAdmin: userData?.isAdmin || false,
      userSelectedCourse: userData?.selectedCourse || null
    })

  } catch (error) {
    console.error('❌ Erro ao verificar acesso do usuário:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 