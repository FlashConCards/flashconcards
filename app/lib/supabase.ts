// TEMPORARIAMENTE DESABILITADO PARA BUILD
// import { createClient } from '@supabase/supabase-js'

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// // Debug: verificar se as variáveis estão carregadas
// console.log('Supabase URL:', supabaseUrl)
// console.log('Supabase Key:', supabaseKey ? 'Presente' : 'Ausente')

// export const supabase = createClient(supabaseUrl, supabaseKey)

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

// Funções para gerenciar pagamentos - TEMPORARIAMENTE DESABILITADAS
export async function addPaymentRecord(payment: PaymentRecord) {
  console.log('Função temporariamente desabilitada')
  return null
}

export async function checkPaymentByEmail(email: string): Promise<PaymentRecord | null> {
  console.log('Função temporariamente desabilitada')
  return null
}

export async function isUserPaid(email: string): Promise<boolean> {
  console.log('Função temporariamente desabilitada')
  return false
}

// Função para simular pagamento (para testes) - TEMPORARIAMENTE DESABILITADA
export async function simulatePaymentApproval(email: string, paymentId: string) {
  console.log('Função temporariamente desabilitada')
  return null
} 