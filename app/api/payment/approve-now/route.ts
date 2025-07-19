import { NextRequest, NextResponse } from 'next/server'
import { updatePaymentStatus } from '@/app/lib/firebase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email não fornecido' },
        { status: 400 }
      )
    }

    // Buscar pagamento pelo email e aprovar
    const { db } = await import('@/app/lib/firebase')
    const { collection, query, where, getDocs, updateDoc } = await import('firebase/firestore')
    
    if (!db) {
      return NextResponse.json(
        { error: 'Firebase não inicializado' },
        { status: 500 }
      )
    }

    // Buscar pagamento pelo email
    const q = query(collection(db, 'payments'), where('email', '==', email))
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: 'Nenhum pagamento encontrado para este email' },
        { status: 404 }
      )
    }

    // Aprovar TODOS os pagamentos deste email
    const updatePromises = querySnapshot.docs.map(async (doc) => {
      await updateDoc(doc.ref, {
        status: 'approved',
        approved_at: new Date().toISOString()
      })
    })

    await Promise.all(updatePromises)
    
    console.log('Pagamentos aprovados para:', email)
    
    return NextResponse.json({
      success: true,
      message: 'Pagamento APROVADO com sucesso no servidor!',
      email,
      approvedCount: querySnapshot.docs.length
    })
  } catch (error: any) {
    console.error('Erro ao aprovar pagamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 