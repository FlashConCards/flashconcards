import { NextRequest, NextResponse } from 'next/server'
import { getSubjects, getCourses } from '@/lib/firebase'

export async function POST(request: NextRequest) {
  try {
    console.log('📥 API /admin/debug-subjects chamada')
    
    const { courseId } = await request.json()
    console.log('📋 Verificando matérias para curso:', courseId)

    // Buscar todos os cursos
    const allCourses = await getCourses()
    console.log('📚 Todos os cursos:', allCourses.length)

    // Buscar todas as matérias
    const allSubjects = await getSubjects()
    console.log('📖 Todas as matérias:', allSubjects.length)

    // Buscar matérias do curso específico
    let courseSubjects = []
    if (courseId) {
      courseSubjects = await getSubjects(courseId)
      console.log('📖 Matérias do curso:', courseSubjects.length)
    }

    return NextResponse.json({
      success: true,
      allCourses: allCourses,
      allSubjects: allSubjects,
      courseSubjects: courseSubjects,
      courseId: courseId
    })

  } catch (error) {
    console.error('❌ Erro ao debug das matérias:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 