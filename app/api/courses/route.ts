import { NextResponse } from 'next/server'
import { getCourses } from '@/lib/firebase'

export async function GET() {
  try {
    console.log('📥 API /courses chamada')
    
    const courses = await getCourses()
    console.log('📋 Cursos encontrados:', courses.length)
    
    return NextResponse.json(courses)
  } catch (error) {
    console.error('❌ Erro ao buscar cursos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 