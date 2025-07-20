import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface Feedback {
  id: string
  name: string
  rating: number
  comment: string
  createdAt: string
  isVerified: boolean
}

// Função para salvar feedback localmente
function saveFeedbackLocally(feedback: any) {
  try {
    const feedbacksPath = path.join(process.cwd(), 'data', 'feedbacks.json')
    
    // Criar diretório se não existir
    const dataDir = path.dirname(feedbacksPath)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    
    // Ler feedbacks existentes ou criar array vazio
    let feedbacks: any[] = []
    if (fs.existsSync(feedbacksPath)) {
      const data = fs.readFileSync(feedbacksPath, 'utf8')
      feedbacks = JSON.parse(data)
    }
    
    // Adicionar novo feedback
    feedbacks.push({
      id: `local_${Date.now()}`,
      ...feedback,
      createdAt: new Date().toISOString(),
      isVerified: true
    })
    
    // Salvar no arquivo
    fs.writeFileSync(feedbacksPath, JSON.stringify(feedbacks, null, 2))
    
    return true
  } catch (error) {
    console.error('Erro ao salvar localmente:', error)
    return false
  }
}

// Função para ler feedbacks localmente
function getFeedbacksLocally(): Feedback[] {
  try {
    const feedbacksPath = path.join(process.cwd(), 'data', 'feedbacks.json')
    
    if (fs.existsSync(feedbacksPath)) {
      const data = fs.readFileSync(feedbacksPath, 'utf8')
      return JSON.parse(data)
    }
    
    return []
  } catch (error) {
    console.error('Erro ao ler feedbacks locais:', error)
    return []
  }
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

    // Tentar salvar no Firebase primeiro
    try {
      console.log('🔍 Tentando salvar no Firebase...')
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

        const docRef = await addDoc(collection(db, 'userFeedback'), feedbackData)
        console.log('✅ Feedback salvo no Firebase! ID:', docRef.id)

        return NextResponse.json({
          success: true,
          message: 'Feedback salvo com sucesso',
          id: docRef.id
        })
      } else {
        throw new Error('Firebase não inicializado')
      }
    } catch (firebaseError: any) {
      console.error('❌ Erro no Firebase:', firebaseError.message)
      
      // Fallback: salvar localmente
      console.log('🔄 Salvando localmente como fallback...')
      const feedbackData = {
        userId: email,
        name: name || 'Usuário',
        rating: parseInt(rating),
        comment,
        createdAt: new Date().toISOString(),
        isVerified: true
      }
      
      const saved = saveFeedbackLocally(feedbackData)
      
      if (saved) {
        console.log('✅ Feedback salvo localmente!')
        return NextResponse.json({
          success: true,
          message: 'Feedback salvo com sucesso (modo local)',
          id: `local_${Date.now()}`
        })
      } else {
        return NextResponse.json(
          { error: 'Erro ao salvar feedback' },
          { status: 500 }
        )
      }
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
    
    // Tentar buscar do Firebase primeiro
    try {
      const { db } = await import('@/app/lib/firebase')
      const { collection, query, orderBy, limit, getDocs } = await import('firebase/firestore')
      
      if (db) {
        console.log('🔍 Buscando feedbacks no Firebase...')
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

        console.log('✅ Feedbacks do Firebase:', feedbacks.length)
        return NextResponse.json(feedbacks)
      } else {
        throw new Error('Firebase não inicializado')
      }
    } catch (firebaseError: any) {
      console.error('❌ Erro no Firebase:', firebaseError.message)
      
      // Fallback: buscar localmente
      console.log('🔄 Buscando feedbacks localmente...')
      const localFeedbacks = getFeedbacksLocally()
      
      console.log('✅ Feedbacks locais:', localFeedbacks.length)
      return NextResponse.json(localFeedbacks)
    }
  } catch (error: any) {
    console.error('❌ Erro ao buscar feedbacks:', error)
    return NextResponse.json([])
  }
} 