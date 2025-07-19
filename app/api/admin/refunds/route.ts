import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Buscar solicitações de reembolso
    const { db } = await import('@/app/lib/firebase')
    const { collection, getDocs, orderBy, query } = await import('firebase/firestore')
    
    if (!db) {
      return NextResponse.json(
        { error: 'Firebase não inicializado' },
        { status: 500 }
      )
    }

    // Buscar todas as solicitações de reembolso ordenadas por data
    const q = query(collection(db, 'refund_requests'), orderBy('created_at', 'desc'))
    const querySnapshot = await getDocs(q)
    
    const refunds = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json({
      success: true,
      refunds
    })
  } catch (error: any) {
    console.error('Erro ao buscar reembolsos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 