'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react'

interface PaymentStatusProps {
  paymentId: string
  onSuccess: () => void
}

export default function PaymentStatus({ paymentId, onSuccess }: PaymentStatusProps) {
  const [status, setStatus] = useState<string>('pending')
  const [isChecking, setIsChecking] = useState(false)

  const checkPaymentStatus = async () => {
    setIsChecking(true)
    try {
      const response = await fetch(`/api/payment/status?payment_id=${paymentId}`)
      const result = await response.json()

      if (result.success) {
        setStatus(result.status)
        if (result.status === 'approved') {
          onSuccess()
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    // Verificar status a cada 5 segundos
    const interval = setInterval(checkPaymentStatus, 5000)
    return () => clearInterval(interval)
  }, [paymentId])

  const getStatusInfo = () => {
    switch (status) {
      case 'approved':
        return {
          icon: <CheckCircle className="h-6 w-6 text-green-600" />,
          text: 'Pagamento Aprovado!',
          description: 'Seu acesso foi liberado com sucesso.',
          color: 'text-green-600'
        }
      case 'pending':
        return {
          icon: <Clock className="h-6 w-6 text-yellow-600" />,
          text: 'Aguardando Pagamento',
          description: 'Aguardando confirmação do pagamento PIX.',
          color: 'text-yellow-600'
        }
      case 'rejected':
        return {
          icon: <XCircle className="h-6 w-6 text-red-600" />,
          text: 'Pagamento Recusado',
          description: 'O pagamento foi recusado. Tente novamente.',
          color: 'text-red-600'
        }
      default:
        return {
          icon: <Clock className="h-6 w-6 text-gray-600" />,
          text: 'Verificando...',
          description: 'Verificando status do pagamento.',
          color: 'text-gray-600'
        }
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <div className="text-center p-6 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-center mb-4">
        {isChecking ? (
          <Loader2 className="h-6 w-6 text-primary-600 animate-spin" />
        ) : (
          statusInfo.icon
        )}
      </div>
      
      <h3 className={`text-lg font-semibold mb-2 ${statusInfo.color}`}>
        {statusInfo.text}
      </h3>
      
      <p className="text-gray-600 mb-4">
        {statusInfo.description}
      </p>
      
      {status === 'pending' && (
        <button
          onClick={checkPaymentStatus}
          disabled={isChecking}
          className="btn-primary py-2 px-4 text-sm"
        >
          {isChecking ? 'Verificando...' : 'Verificar Agora'}
        </button>
      )}
    </div>
  )
} 