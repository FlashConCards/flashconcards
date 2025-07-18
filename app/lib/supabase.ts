import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Debug: verificar se as variáveis estão carregadas
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key:', supabaseKey ? 'Presente' : 'Ausente')

export const supabase = createClient(supabaseUrl, supabaseKey)

// Interface para pagamentos
export interface PaymentRecord {
  id?: string
  email: string
  payment_id: string
  amount: number
  status: 'approved' | 'pending' | 'rejected'
  created_at?: string
  method: 'pix' | 'card'
}

// Funções para gerenciar pagamentos
export async function addPaymentRecord(payment: PaymentRecord) {
  console.log('Tentando salvar pagamento:', payment)
  
  const { data, error } = await supabase
    .from('payments')
    .insert([payment])
    .select()

  if (error) {
    console.error('Erro ao salvar pagamento:', error)
    return null
  }

  console.log('Pagamento salvo com sucesso:', data)
  return data?.[0]
}

export async function checkPaymentByEmail(email: string): Promise<PaymentRecord | null> {
  console.log('Verificando pagamento para email:', email)
  
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('email', email.toLowerCase())
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    console.error('Erro ao verificar pagamento:', error)
    return null
  }

  console.log('Pagamento encontrado:', data)
  return data
}

export async function isUserPaid(email: string): Promise<boolean> {
  const payment = await checkPaymentByEmail(email)
  const result = payment !== null
  console.log('Usuário pagou:', result)
  return result
}

// Função para simular pagamento (para testes)
export async function simulatePaymentApproval(email: string, paymentId: string) {
  const payment: PaymentRecord = {
    email: email.toLowerCase(),
    payment_id: paymentId,
    amount: 1.00,
    status: 'approved',
    method: 'pix'
  }

  return await addPaymentRecord(payment)
} 