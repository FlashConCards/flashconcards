import { NextRequest, NextResponse } from 'next/server'
import { 
  getCourseComments, 
  createCourseComment, 
  deleteCourseComment 
} from '@/lib/firebase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    if (courseId) {
      // Buscar comentários de um curso específico
      const comments = await getCourseComments(courseId)
      return NextResponse.json(comments)
    } else {
      // Buscar todos os comentários
      const comments = await getCourseComments()
      return NextResponse.json(comments)
    }
  } catch (error) {
    console.error('Error getting course comments:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, courseId, comment, userName, userEmail } = body

    if (!userId || !courseId || !comment) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    const commentId = await createCourseComment({
      userId,
      courseId,
      comment,
      userName: userName || 'Usuário',
      userEmail: userEmail || ''
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Comentário enviado com sucesso!',
      commentId
    })
  } catch (error) {
    console.error('Error creating course comment:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('commentId')

    if (!commentId) {
      return NextResponse.json(
        { error: 'ID do comentário não fornecido' },
        { status: 400 }
      )
    }

    await deleteCourseComment(commentId)
    return NextResponse.json({ 
      success: true, 
      message: 'Comentário excluído com sucesso' 
    })
  } catch (error) {
    console.error('Error deleting course comment:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 