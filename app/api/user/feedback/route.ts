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

    // Salvar feedback diretamente no Firebase
    try {
      console.log('🔍 Importando Firebase...')
      const { db } = await import('@/app/lib/firebase')
      const { collection, addDoc } = await import('firebase/firestore')
      
      console.log('🔍 Firebase importado, verificando db...')
      if (!db) {
        console.log('❌ Firebase não inicializado')
        return NextResponse.json(
          { error: 'Firebase não inicializado' },
          { status: 500 }
        )
      }

      console.log('✅ Firebase inicializado, criando dados...')
      const feedbackData = {
        userId: email,
        name: name || 'Usuário',
        rating: parseInt(rating),
        comment,
        createdAt: new Date().toISOString(),
        isVerified: true
      }

      console.log('Salvando feedback no Firebase:', feedbackData)

      console.log('🔍 Acessando coleção userFeedback...')
      const feedbackCollection = collection(db, 'userFeedback')
      console.log('✅ Coleção acessada')

      console.log('🔍 Adicionando documento...')
      const docRef = await addDoc(feedbackCollection, feedbackData)

      console.log('✅ Feedback salvo com sucesso! ID:', docRef.id)

      return NextResponse.json({
        success: true,
        message: 'Feedback salvo com sucesso',
        id: docRef.id
      })
    } catch (firebaseError: any) {
      console.error('❌ Erro no Firebase:', firebaseError)
      console.error('❌ Detalhes do erro:', firebaseError.message)
      console.error('❌ Stack trace:', firebaseError.stack)
      return NextResponse.json(
        { error: 'Erro ao salvar no Firebase', details: firebaseError.message },
        { status: 500 }
      )
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
    console.log('=== BUSCANDO FEEDBACKS ===')
    
    const { db } = await import('@/app/lib/firebase')
    const { collection, query, orderBy, limit, getDocs } = await import('firebase/firestore')
    
    if (!db) {
      console.log('❌ Firebase não inicializado')
      return NextResponse.json([])
    }

    console.log('🔍 Buscando feedbacks no Firebase...')

    // Buscar feedbacks verificados
    const feedbackQuery = query(
      collection(db, 'userFeedback'),
      orderBy('createdAt', 'desc'),
      limit(10)
    )
    const feedbackSnapshot = await getDocs(feedbackQuery)
    
    console.log('Feedbacks encontrados:', feedbackSnapshot.size)
    
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

    console.log('✅ Feedbacks retornados:', feedbacks.length)

    return NextResponse.json(feedbacks)
  } catch (error: any) {
    console.error('❌ Erro ao buscar feedbacks:', error)
    return NextResponse.json([])
  }
} 