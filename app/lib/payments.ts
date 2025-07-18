// Sistema para verificar pagamentos por email
export interface PaymentRecord {
  email: string
  paymentId: string
  amount: number
  status: 'approved' | 'pending' | 'rejected'
  date: string
  method: 'pix' | 'card'
}

// Simulação de banco de dados de pagamentos
// Em produção, isso seria um banco de dados real
const paymentRecords: PaymentRecord[] = []

export function addPaymentRecord(payment: PaymentRecord) {
  paymentRecords.push(payment)
  // Em produção, salvaria no banco de dados
  console.log('Pagamento registrado:', payment)
}

export function checkPaymentByEmail(email: string): PaymentRecord | null {
  const payment = paymentRecords.find(p => 
    p.email.toLowerCase() === email.toLowerCase() && 
    p.status === 'approved'
  )
  return payment || null
}

export function isUserPaid(email: string): boolean {
  return checkPaymentByEmail(email) !== null
}

// Função para simular pagamento aprovado (para testes)
export function simulatePaymentApproval(email: string, paymentId: string) {
  const payment: PaymentRecord = {
    email,
    paymentId,
    amount: 1.00,
    status: 'approved',
    date: new Date().toISOString(),
    method: 'pix'
  }
  addPaymentRecord(payment)
  return payment
} 