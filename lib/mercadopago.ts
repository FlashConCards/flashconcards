import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'

// Configure Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

// Payment functions
export const createPaymentPreference = async (paymentData: any) => {
  try {
    const preference = {
      items: [
        {
          id: '1',
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

    const preferenceClient = new Preference(client)
    const response = await preferenceClient.create({ body: preference })
    return response
  } catch (error) {
    throw error
  }
}

export const createPixPayment = async (paymentData: any) => {
  try {
    const paymentClient = new Payment(client)
    const pixResponse = await paymentClient.create({
      body: {
        transaction_amount: paymentData.amount,
        description: paymentData.description || 'Curso FlashConCards',
        payment_method_id: 'pix',
        payer: {
          email: paymentData.email,
        },
        external_reference: paymentData.externalReference,
      }
    })

    return pixResponse
  } catch (error) {
    throw error
  }
}

export const getPaymentStatus = async (paymentId: string) => {
  try {
    const paymentClient = new Payment(client)
    const payment = await paymentClient.get({ id: paymentId })
    return payment
  } catch (error) {
    throw error
  }
}

export default client 