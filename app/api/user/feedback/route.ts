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

    // Verificar se o usuário tem algum pagamento
    const { db } = await import('@/app/lib/firebase')
    const { collection, query, where, getDocs } = await import('firebase/firestore')
    
    if (!db) {
      console.log('❌ Firebase não inicializado')
      return NextResponse.json(
        { error: 'Firebase não inicializado' },
        { status: 500 }
      )
    }

    console.log('🔍 Verificando pagamento para email:', email)

    // Verificar se o usuário tem qualquer pagamento (aprovado ou pendente)
    const paymentQuery = query(
      collection(db, 'payments'), 
      where('email', '==', email)
    )
    const paymentSnapshot = await getDocs(paymentQuery)
    
    console.log('Pagamentos encontrados:', paymentSnapshot.size)
    
    if (paymentSnapshot.empty) {
      console.log('❌ Usuário não tem pagamento')
      return NextResponse.json(
        { error: 'Usuário não tem pagamento registrado' },
        { status: 403 }
      )
    }

    console.log('✅ Usuário tem pagamento registrado')

    // Salvar feedback no Firebase
    const { doc, setDoc } = await import('firebase/firestore')
    const feedbackId = `${email}_${Date.now()}`
    const feedbackRef = doc(db, 'userFeedback', feedbackId)

    const feedbackData = {
      userId: email,
      name: name || 'Usuário',
      rating: parseInt(rating),
      comment,
      createdAt: new Date().toISOString(),
      isVerified: true // Marcar como verificado (usuário com pagamento)
    }

    console.log('Salvando feedback:', feedbackData)

    await setDoc(feedbackRef, feedbackData)

    console.log('✅ Feedback salvo com sucesso')

    return NextResponse.json({
      success: true,
      message: 'Feedback salvo com sucesso'
    })
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