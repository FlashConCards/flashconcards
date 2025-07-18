import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/app/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Testar conexão com Supabase
    const { data, error } = await supabase
      .from('payments')
      .select('count')
      .limit(1)

    if (error) {
      console.error('Erro na conexão com Supabase:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        details: 'Erro na conexão com Supabase'
      })
    }

    // Testar inserção de dados
    const testPayment = {
      email: 'teste@teste.com',
      payment_id: 'test-payment-123',
      amount: 1.00,
      status: 'approved',
      method: 'pix'
    }

    const { data: insertData, error: insertError } = await supabase
      .from('payments')
      .insert([testPayment])
      .select()

    if (insertError) {
      console.error('Erro ao inserir teste:', insertError)
      return NextResponse.json({
        success: false,
        error: insertError.message,
        details: 'Erro ao inserir dados de teste'
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase conectado e funcionando!',
      testData: insertData
    })

  } catch (error: any) {
    console.error('Erro geral:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      details: 'Erro geral no teste'
    })
  }
} 