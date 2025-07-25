import { MercadoPagoConfig, Payment, PaymentMethod } from 'mercadopago'

// CONFIGURAÇÃO 100% REAL - TOKEN DE PRODUÇÃO
const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN

if (!accessToken) {
  console.error('❌ ERRO: MERCADO_PAGO_ACCESS_TOKEN não está configurado!')
  console.error('Configure no Vercel: MERCADO_PAGO_ACCESS_TOKEN = APP_USR-1980247803255472-072422-f04f56e43fba7e2a75a5f79c97214d45-2583165550')
}

// Configurar Mercado Pago com token REAL
const client = new MercadoPagoConfig({ 
  accessToken: accessToken || 'APP_USR-1980247803255472-072422-f04f56e43fba7e2a75a5f79c97214d45-2583165550'
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

// Função para criar pagamento PIX 100% REAL
export async function createPixPayment(paymentData: PixPaymentData) {
  try {
    console.log('🚀 CRIANDO PIX 100% REAL...')
    console.log('Token configurado:', accessToken ? '✅ SIM' : '❌ NÃO')
    console.log('Dados do pagamento:', paymentData)
    
    // Criar pagamento REAL no Mercado Pago
    const result = await payment.create({
      body: {
        transaction_amount: paymentData.transaction_amount,
        description: paymentData.description,
        payment_method_id: 'pix',
        payer: paymentData.payer
      }
    })

    console.log('✅ PAGAMENTO CRIADO COM SUCESSO:', result)

    // Pegar QR code REAL do Mercado Pago
    const qrCode = result.point_of_interaction?.transaction_data?.qr_code
    const qrCodeBase64 = result.point_of_interaction?.transaction_data?.qr_code_base64
    
    console.log('QR Code:', qrCode ? '✅ DISPONÍVEL' : '❌ NÃO DISPONÍVEL')
    console.log('QR Code Base64:', qrCodeBase64 ? '✅ DISPONÍVEL' : '❌ NÃO DISPONÍVEL')

    if (!qrCode && !qrCodeBase64) {
      console.error('❌ ERRO: QR code não foi gerado pelo Mercado Pago')
      console.error('Verifique se o token tem permissões para PIX')
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
    console.error('❌ ERRO AO CRIAR PIX:', error)
    console.error('Mensagem:', error.message)
    console.error('Stack:', error.stack)
    
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
      status_detail: result.status_detail
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