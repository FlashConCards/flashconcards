import { NextResponse } from 'next/server'
import { createCourse } from '@/lib/firebase'

export async function POST() {
  try {
    console.log('📥 API /admin/create-test-course chamada')
    
    // Criar um curso de teste
    const courseData = {
      name: 'Curso de Teste',
      description: 'Este é um curso de teste para verificar o funcionamento do sistema',
      price: 99.90,
      image: 'https://via.placeholder.com/400x300/cccccc/666666?text=Curso+de+Teste',
      expirationMonths: 6,
      isActive: true,
      isPublic: true
    }

    console.log('👤 Criando curso de teste:', courseData)

    // Criar curso usando a função do Firebase
    const courseId = await createCourse(courseData)
    console.log('✅ Curso criado com sucesso:', courseId)

    return NextResponse.json({
      success: true,
      message: 'Curso de teste criado com sucesso!',
      courseId: courseId,
      course: { id: courseId, ...courseData }
    })

  } catch (error) {
    console.error('❌ Erro ao criar curso de teste:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 