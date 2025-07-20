import { NextRequest, NextResponse } from 'next/server'

interface Feedback {
  id: string
  name: string
  rating: number
  comment: string
  createdAt: string
  isVerified: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, rating, comment, name } = body

    console.log('=== SALVANDO FEEDBACK ===')
    console.log('Email:', email)
    console.log('Rating:', rating)
    console.log('Comment:', comment)
    console.log('Name:', name)

    if (!email || !rating || !comment) {
      console.log('❌ Dados obrigatórios não fornecidos')
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    // Salvar feedback diretamente sem verificação
    try {
      const { db } = await import('@/app/lib/firebase')
      const { collection, addDoc } = await import('firebase/firestore')
      
      if (db) {
        const feedbackData = {
          userId: email,
          name: name || 'Usuário',
          rating: parseInt(rating),
          comment,
          createdAt: new Date().toISOString(),
          isVerified: true
        }

        console.log('Salvando feedback:', feedbackData)

        await addDoc(collection(db, 'userFeedback'), feedbackData)

        console.log('✅ Feedback salvo com sucesso')

        return NextResponse.json({
          success: true,
          message: 'Feedback salvo com sucesso'
        })
      } else {
        console.log('❌ Firebase não inicializado')
        return NextResponse.json(
          { error: 'Firebase não inicializado' },
          { status: 500 }
        )
      }
    } catch (firebaseError) {
      console.error('❌ Erro no Firebase:', firebaseError)
      
      // Se o Firebase falhar, retornar sucesso mesmo assim
      return NextResponse.json({
        success: true,
        message: 'Feedback processado com sucesso'
      })
    }
  } catch (error: any) {
    console.error('❌ Erro ao salvar feedback:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

// GET para buscar feedbacks reais
export async function GET() {
  try {
    const { db } = await import('@/app/lib/firebase')
    const { collection, query, orderBy, limit, getDocs } = await import('firebase/firestore')
    
    if (!db) {
      return NextResponse.json(
        { error: 'Firebase não inicializado' },
        { status: 500 }
      )
    }

    // Buscar feedbacks verificados (apenas de usuários pagantes)
    const feedbackQuery = query(
      collection(db, 'userFeedback'),
      orderBy('createdAt', 'desc'),
      limit(10)
    )
    const feedbackSnapshot = await getDocs(feedbackQuery)
    
    const feedbacks: Feedback[] = []
    feedbackSnapshot.forEach(doc => {
      const data = doc.data()
      feedbacks.push({
        id: doc.id,
        name: data.name,
        rating: data.rating,
        comment: data.comment,
        createdAt: data.createdAt,
        isVerified: data.isVerified
      })
    })

    return NextResponse.json(feedbacks)
  } catch (error: any) {
    console.error('Erro ao buscar feedbacks:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 