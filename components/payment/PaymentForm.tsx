'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { CreditCardIcon, QrCodeIcon } from '@heroicons/react/24/outline'
import { Course } from '@/types'

interface PaymentFormProps {
  course: Course
  userId: string
}

export default function PaymentForm({ course, userId }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix')
  const [loading, setLoading] = useState(false)
  const [pixQrCode, setPixQrCode] = useState<string>('')
  const [pixQrCodeBase64, setPixQrCodeBase64] = useState<string>('')
  const router = useRouter()

  const handlePayment = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: course.id,
          userId,
          amount: course.price,
          paymentMethod,
        }),
      })

      const data = await response.json()

      if (data.success) {
        if (paymentMethod === 'pix') {
          setPixQrCode(data.pixQrCode)
          setPixQrCodeBase64(data.pixQrCodeBase64)
          toast.success('QR Code PIX gerado! Escaneie para pagar.')
        } else {
          // Redirecionar para página de pagamento com cartão
          window.location.href = data.paymentUrl
        }
      } else {
        toast.error('Erro ao processar pagamento.')
      }
    } catch (error) {
      console.error('Erro no pagamento:', error)
      toast.error('Erro ao processar pagamento.')
    } finally {
      setLoading(false)
    }
  }

  const copyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(pixQrCode)
      toast.success('Código PIX copiado!')
    } catch (error) {
      toast.error('Erro ao copiar código PIX.')
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Finalizar Compra
          </h2>
          <p className="text-gray-600">
            {course.name}
          </p>
        </div>

        {/* Resumo do Pedido */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Resumo do Pedido</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Curso</span>
              <span className="font-medium">{course.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Preço</span>
              <span className="font-bold text-lg text-primary-600">
                R$ {course.price.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>
        </div>

        {/* Método de Pagamento */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Método de Pagamento</h3>
          <div className="space-y-3">
            <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                value="pix"
                checked={paymentMethod === 'pix'}
                onChange={(e) => setPaymentMethod(e.target.value as 'pix' | 'card')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <div className="ml-3 flex items-center">
                <QrCodeIcon className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-medium">PIX</span>
              </div>
            </label>

            <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value as 'pix' | 'card')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <div className="ml-3 flex items-center">
                <CreditCardIcon className="w-5 h-5 text-blue-600 mr-2" />
                <span className="font-medium">Cartão de Crédito/Débito</span>
              </div>
            </label>
          </div>
        </div>

        {/* QR Code PIX */}
        {pixQrCode && paymentMethod === 'pix' && (
          <div className="mb-6 text-center">
            <h3 className="font-semibold text-gray-900 mb-3">Pague com PIX</h3>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <img
                src={pixQrCodeBase64}
                alt="QR Code PIX"
                className="mx-auto mb-4"
                style={{ width: '200px', height: '200px' }}
              />
              <button
                onClick={copyPixCode}
                className="btn-outline text-sm"
              >
                Copiar código PIX
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              Escaneie o QR Code ou copie o código PIX para pagar
            </p>
          </div>
        )}

        {/* Botão de Pagamento */}
        {!pixQrCode && (
          <button
            onClick={handlePayment}
            disabled={loading}
            className="btn-primary w-full py-3 text-lg font-semibold"
          >
            {loading ? 'Processando...' : `Pagar R$ ${course.price.toFixed(2).replace('.', ',')}`}
          </button>
        )}

        {/* Informações de Segurança */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Pagamento 100% seguro</span>
          </div>
        </div>
      </div>
    </div>
  )
} 