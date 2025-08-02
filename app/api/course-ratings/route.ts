import { NextRequest, NextResponse } from 'next/server'
import { 
  getCourseRatings, 
  createCourseRating, 
  updateCourseRating, 
  deleteCourseRating,
  getUserCourseRating,
  getCourseAverageRating,
  getUserAccessibleCourses,
  getUserData
} from '@/lib/firebase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const userId = searchParams.get('userId')

    if (courseId && userId) {
      // Buscar avaliação específica do usuário para o curso
      const userRating = await getUserCourseRating(userId, courseId)
      return NextResponse.json(userRating)
    } else if (courseId) {
      // Buscar todas as avaliações de um curso
      const ratings = await getCourseRatings(courseId)
      const averageRating = await getCourseAverageRating(courseId)
      return NextResponse.json({ ratings, averageRating })
    } else {
      // Buscar todas as avaliações
      const ratings = await getCourseRatings()
      return NextResponse.json(ratings)
    }
  } catch (error) {
    console.error('Error getting course ratings:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, courseId, rating, comment } = body

    if (!userId || !courseId || !rating) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    // Verificar se o usuário tem acesso ao curso
    const userData = await getUserData(userId)
    if (!userData) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o usuário tem acesso ao curso específico
    const accessibleCourses = await getUserAccessibleCourses(userId)
    if (!accessibleCourses.includes(courseId)) {
      return NextResponse.json(
        { error: 'Você não tem acesso a este curso para avaliá-lo' },
        { status: 403 }
      )
    }

    // Verificar se o usuário já avaliou este curso
    const existingRating = await getUserCourseRating(userId, courseId)

    if (existingRating) {
      return NextResponse.json(
        { error: 'Você já avaliou este curso. Cada usuário pode avaliar um curso apenas uma vez.' },
        { status: 400 }
      )
    } else {
      // Criar nova avaliação
      const ratingId = await createCourseRating({
        userId,
        courseId,
        rating,
        comment: comment || '',
        userName: body.userName || 'Usuário',
        userEmail: body.userEmail || ''
      })
      return NextResponse.json({ 
        success: true, 
        message: 'Avaliação criada com sucesso',
        ratingId
      })
    }
  } catch (error) {
    console.error('Error creating/updating course rating:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ratingId = searchParams.get('ratingId')

    if (!ratingId) {
      return NextResponse.json(
        { error: 'ID da avaliação não fornecido' },
        { status: 400 }
      )
    }

    await deleteCourseRating(ratingId)
    return NextResponse.json({ 
      success: true, 
      message: 'Avaliação excluída com sucesso' 
    })
  } catch (error) {
    console.error('Error deleting course rating:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 