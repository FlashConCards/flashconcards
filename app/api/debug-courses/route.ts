import { NextResponse } from 'next/server'
import { getCourses } from '@/lib/firebase'

export async function GET() {
  try {
    console.log('📥 API /debug-courses chamada')
    
    const courses = await getCourses()
    console.log('📚 Cursos encontrados:', courses.length)
    
    // Log detalhado de cada curso
    courses.forEach((course, index) => {
      console.log(`\n--- Curso ${index + 1} ---`)
      console.log('ID:', course.id)
      console.log('Nome:', course.name)
      console.log('Imagem:', course.image ? 'Existe' : 'Não existe')
      console.log('URL da imagem:', course.image)
      console.log('Preço:', course.price)
      console.log('Ativo:', course.isActive)
      console.log('Público:', course.isPublic)
    })
    
    return NextResponse.json({
      success: true,
      courses: courses,
      total: courses.length
    })
    
  } catch (error) {
    console.error('❌ Erro ao debug dos cursos:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 