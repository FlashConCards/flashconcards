import { NextRequest, NextResponse } from 'next/server'
import { getPaymentStatus } from '@/app/lib/mercadopago'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const paymentId = searchParams.get('payment_id')

    if (!paymentId) {
      return NextResponse.json(
        { error: 'ID do pagamento não fornecido' },
        { status: 400 }
      )
    }

    const result = await getPaymentStatus(paymentId)

    if (result.success) {
      return NextResponse.json({
        success: true,
        status: result.status,
        status_detail: result.status_detail,
        external_reference: result.external_reference
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Erro ao verificar status do pagamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 