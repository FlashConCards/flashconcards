import { MercadoPagoConfig, Payment, PaymentMethod } from 'mercadopago'

// Verificar se o token está configurado
const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
if (!accessToken) {
  console.error('MERCADO_PAGO_ACCESS_TOKEN não está configurado!')
}

// Configurar o Mercado Pago com suas credenciais
// Usar token de teste se o token de produção não estiver configurado
const client = new MercadoPagoConfig({ 
  accessToken: accessToken || 'TEST-123456789-abcdef-1234567890abcdef'
})

const payment = new Payment(client)
const paymentMethod = new PaymentMethod(client)

export interface PaymentData {
  transaction_amount: number
  description: string
  payment_method_id: string
  payer: {
    email: string
    first_name: string
    last_name: string
  }
  installments?: number
  token?: string
  issuer_id?: string
}

export interface PixPaymentData {
  transaction_amount: number
  description: string
  payment_method_id: 'pix'
  payer: {
    email: string
    first_name: string
    last_name: string
  }
}

// Função para criar pagamento com cartão
export async function createCardPayment(paymentData: PaymentData) {
  try {
    const result = await payment.create({
      body: {
        transaction_amount: paymentData.transaction_amount,
        token: paymentData.token,
        description: paymentData.description,
        installments: paymentData.installments || 1,
        payment_method_id: paymentData.payment_method_id,
        issuer_id: paymentData.issuer_id ? parseInt(paymentData.issuer_id) : undefined,
        payer: paymentData.payer
      }
    })

    return {
      success: true,
      payment_id: result.id,
      status: result.status,
      status_detail: result.status_detail,
      external_reference: result.external_reference
    }
  } catch (error: any) {
    console.error('Erro ao criar pagamento com cartão:', error)
    return {
      success: false,
      error: error.message || 'Erro ao processar pagamento'
    }
  }
}

// Função para criar pagamento PIX
export async function createPixPayment(paymentData: PixPaymentData) {
  try {
    console.log('Criando pagamento PIX com dados:', paymentData)
    console.log('Token configurado:', accessToken ? 'Sim' : 'Não')
    
    // Para ambiente de desenvolvimento, usar dados de teste
    const testPayer = {
      email: paymentData.payer.email,
      first_name: paymentData.payer.first_name || 'Teste',
      last_name: paymentData.payer.last_name || 'Usuário'
    }
    
    const result = await payment.create({
      body: {
        transaction_amount: paymentData.transaction_amount,
        description: paymentData.description,
        payment_method_id: 'pix',
        payer: testPayer
      }
    })

    console.log('Resultado do pagamento PIX:', result)

    // Verificar se o QR code foi gerado
    const qrCode = result.point_of_interaction?.transaction_data?.qr_code
    const qrCodeBase64 = result.point_of_interaction?.transaction_data?.qr_code_base64
    
    if (!qrCode && !qrCodeBase64) {
      console.error('QR code não foi gerado pelo Mercado Pago')
      return {
        success: false,
        error: 'QR code não foi gerado. Verifique as permissões do token.'
      }
    }

    return {
      success: true,
      payment_id: result.id,
      status: result.status,
      qr_code: qrCode,
      qr_code_base64: qrCodeBase64,
      external_reference: result.external_reference
    }
  } catch (error: any) {
    console.error('Erro detalhado ao criar pagamento PIX:', error)
    console.error('Mensagem de erro:', error.message)
    console.error('Stack trace:', error.stack)
    
    // Se for erro de permissão, sugerir token de teste
    if (error.message.includes('Collector user without key enabled for QR render')) {
      return {
        success: false,
        error: 'Token sem permissão para gerar QR code. Use um token de produção válido.'
      }
    }
    
    return {
      success: false,
      error: error.message || 'Erro ao processar pagamento PIX'
    }
  }
}

// Função para verificar status do pagamento
export async function getPaymentStatus(paymentId: string) {
  try {
    const result = await payment.get({ id: paymentId })
    return {
      success: true,
      status: result.status,
      status_detail: result.status_detail,
      external_reference: result.external_reference
    }
  } catch (error: any) {
    console.error('Erro ao verificar status do pagamento:', error)
    return {
      success: false,
      error: error.message || 'Erro ao verificar status'
    }
  }
}

// Função para obter métodos de pagamento disponíveis
export async function getPaymentMethods() {
  try {
    // Por enquanto, retornamos métodos fixos
    // Em produção, você pode implementar a busca real dos métodos
    return {
      success: true,
      methods: [
        { id: 'pix', name: 'PIX' },
        { id: 'visa', name: 'Visa' },
        { id: 'mastercard', name: 'Mastercard' },
        { id: 'elo', name: 'Elo' }
      ]
    }
  } catch (error: any) {
    console.error('Erro ao obter métodos de pagamento:', error)
    return {
      success: false,
      error: error.message || 'Erro ao obter métodos de pagamento'
    }
  }
} 