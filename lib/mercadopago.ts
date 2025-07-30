import mercadopago from 'mercadopago'

// Configure Mercado Pago
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

// Payment functions
export const createPaymentPreference = async (paymentData: any) => {
  try {
    const preference = {
      items: [
        {
          title: paymentData.title || 'Curso FlashConCards',
          unit_price: paymentData.amount,
          quantity: 1,
        },
      ],
      payer: {
        email: paymentData.email,
      },
      back_urls: {
        success: `${process.env.NEXTAUTH_URL}/payment/success`,
        failure: `${process.env.NEXTAUTH_URL}/payment/failure`,
        pending: `${process.env.NEXTAUTH_URL}/payment/pending`,
      },
      auto_return: 'approved',
      notification_url: `${process.env.NEXTAUTH_URL}/api/payment/webhook`,
      external_reference: paymentData.externalReference,
    }

    const response = await mercadopago.preferences.create(preference)
    return response.body
  } catch (error) {
    throw error
  }
}

export const createPixPayment = async (paymentData: any) => {
  try {
    const pixResponse = await mercadopago.payment.create({
      transaction_amount: paymentData.amount,
      description: paymentData.description || 'Curso FlashConCards',
      payment_method_id: 'pix',
      payer: {
        email: paymentData.email,
      },
      external_reference: paymentData.externalReference,
    })

    return pixResponse.body
  } catch (error) {
    throw error
  }
}

export const getPaymentStatus = async (paymentId: string) => {
  try {
    const payment = await mercadopago.payment.findById(paymentId)
    return payment.body
  } catch (error) {
    throw error
  }
}

export default mercadopago 