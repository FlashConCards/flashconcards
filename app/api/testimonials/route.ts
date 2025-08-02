import { NextRequest, NextResponse } from 'next/server'
import { 
  getTestimonials, 
  createTestimonial, 
  updateTestimonialStatus 
} from '@/lib/firebase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as 'pending' | 'approved' | 'rejected' | 'all' | null

    const testimonials = await getTestimonials(status || 'approved')
    return NextResponse.json(testimonials)
  } catch (error) {
    console.error('Error getting testimonials:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, content, rating, userId, userEmail } = body

    if (!name || !content || !rating) {
      return NextResponse.json(
        { error: 'Nome, conteúdo e avaliação são obrigatórios' },
        { status: 400 }
      )
    }

    const testimonialId = await createTestimonial({
      name,
      content,
      rating: parseInt(rating),
      userId: userId || null,
      userEmail: userEmail || '',
      course: body.course || 'Plataforma FlashConCards'
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Depoimento enviado com sucesso! Aguarde aprovação.',
      testimonialId
    })
  } catch (error) {
    console.error('Error creating testimonial:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { testimonialId, status } = body

    if (!testimonialId || !status) {
      return NextResponse.json(
        { error: 'ID do depoimento e status são obrigatórios' },
        { status: 400 }
      )
    }

    await updateTestimonialStatus(testimonialId, status)
    return NextResponse.json({ 
      success: true, 
      message: 'Status do depoimento atualizado com sucesso' 
    })
  } catch (error) {
    console.error('Error updating testimonial status:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 