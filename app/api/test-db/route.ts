import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST() {
  try {
    // Teste 1: Inserir um pagamento de teste
    const { data: insertData, error: insertError } = await supabase
      .from('payments')
      .insert([
        {
          email: 'teste@exemplo.com',
          payment_id: 'test_payment_123',
          amount: 100,
          status: 'approved',
          method: 'pix'
        }
      ])
      .select()

    if (insertError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Erro ao inserir: ' + insertError.message,
        details: insertError
      }, { status: 500 })
    }

    // Teste 2: Consultar o pagamento inserido
    const { data: queryData, error: queryError } = await supabase
      .from('payments')
      .select('*')
      .eq('email', 'teste@exemplo.com')

    if (queryError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Erro ao consultar: ' + queryError.message,
        details: queryError
      }, { status: 500 })
    }

    // Teste 3: Limpar o dado de teste
    const { error: deleteError } = await supabase
      .from('payments')
      .delete()
      .eq('email', 'teste@exemplo.com')

    return NextResponse.json({
      success: true,
      message: 'Conexão com Supabase funcionando perfeitamente!',
      insertResult: insertData,
      queryResult: queryData,
      deleteError: deleteError?.message || 'Nenhum erro'
    })

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Erro geral: ' + (error as Error).message 
    }, { status: 500 })
  }
} 