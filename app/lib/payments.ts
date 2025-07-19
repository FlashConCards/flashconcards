import { addPaymentRecord as addPaymentToFirebase, checkPaymentByEmail as checkPaymentInFirebase, isUserPaid as isUserPaidInFirebase, PaymentRecord as FirebasePaymentRecord, updatePaymentStatus as updatePaymentStatusInFirebase } from './firebase'

// Sistema para verificar pagamentos por email usando Firebase
export interface PaymentRecord {
  email: string
  paymentId: string
  amount: number
  status: 'approved' | 'pending' | 'rejected'
  date: string
  method: 'pix' | 'card'
}

// Função para converter PaymentRecord local para Firebase
function convertToFirebasePayment(payment: PaymentRecord): FirebasePaymentRecord {
  return {
    email: payment.email,
    payment_id: payment.paymentId,
    amount: payment.amount,
    status: payment.status,
    created_at: payment.date,
    method: payment.method
  }
}

// Função para converter Firebase PaymentRecord para local
function convertFromFirebasePayment(firebasePayment: FirebasePaymentRecord): PaymentRecord {
  return {
    email: firebasePayment.email,
    paymentId: firebasePayment.payment_id,
    amount: firebasePayment.amount,
    status: firebasePayment.status,
    date: firebasePayment.created_at || new Date().toISOString(),
    method: firebasePayment.method
  }
}

export async function addPaymentRecord(payment: PaymentRecord) {
  try {
    const firebasePayment = convertToFirebasePayment(payment)
    await addPaymentToFirebase(firebasePayment)
    console.log('Pagamento registrado no Firebase:', payment)
  } catch (error) {
    console.error('Erro ao registrar pagamento:', error)
  }
}

export async function checkPaymentByEmail(email: string): Promise<PaymentRecord | null> {
  try {
    const firebasePayment = await checkPaymentInFirebase(email)
    if (firebasePayment) {
      return convertFromFirebasePayment(firebasePayment)
    }
    return null
  } catch (error) {
    console.error('Erro ao verificar pagamento:', error)
    return null
  }
}

export async function isUserPaid(email: string): Promise<boolean> {
  try {
    return await isUserPaidInFirebase(email)
  } catch (error) {
    console.error('Erro ao verificar se usuário pagou:', error)
    return false
  }
}

export async function updatePaymentStatus(paymentId: string, status: 'approved' | 'pending' | 'rejected') {
  try {
    await updatePaymentStatusInFirebase(paymentId, status)
    console.log('Status do pagamento atualizado:', paymentId, status)
  } catch (error) {
    console.error('Erro ao atualizar status do pagamento:', error)
  }
}

// Função para simular pagamento aprovado (para testes)
export async function simulatePaymentApproval(email: string, paymentId: string) {
  const payment: PaymentRecord = {
    email,
    paymentId,
    amount: 1.00,
    status: 'approved',
    date: new Date().toISOString(),
    method: 'pix'
  }
  await addPaymentRecord(payment)
  return payment
} 