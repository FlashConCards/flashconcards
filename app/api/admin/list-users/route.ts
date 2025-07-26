import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

export async function GET(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json(
        { error: 'Firebase não inicializado' },
        { status: 500 }
      )
    }

    // Buscar todos os usuários
    const usersSnapshot = await getDocs(collection(db, 'users'))
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    // Buscar todos os pagamentos
    const paymentsSnapshot = await getDocs(collection(db, 'payments'))
    const payments = paymentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json({
      success: true,
      users,
      payments
    })

  } catch (error: any) {
    console.error('Erro ao listar usuários:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 