'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'

interface RefundRequest {
  id: string
  email: string
  payment_id: string
  amount: number
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  method: string
}

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState<RefundRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchRefunds()
  }, [])

  const fetchRefunds = async () => {
    try {
      const response = await fetch('/api/admin/refunds')
      const data = await response.json()
      if (data.success) {
        setRefunds(data.refunds)
      }
    } catch (error) {
      console.error('Erro ao buscar reembolsos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = async (refundId: string, action: 'approve' | 'reject') => {
    setProcessingId(refundId)
    
    try {
      const response = await fetch('/api/payment/approve-refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refundId, action })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Atualizar lista
        await fetchRefunds()
        alert(data.message)
      } else {
        alert('Erro: ' + data.error)
      }
    } catch (error) {
      alert('Erro ao processar ação')
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente'
      case 'approved':
        return 'Aprovado'
      case 'rejected':
        return 'Rejeitado'
      default:
        return 'Desconhecido'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando reembolsos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 p-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-8 shadow-2xl"
        >
          <div className="flex items-center justify-center mb-6">
            <AlertCircle className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">Administração de Reembolsos</span>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Gerenciar Solicitações de Reembolso
          </h1>
          
          {refunds.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Nenhuma solicitação de reembolso encontrada.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {refunds.map((refund) => (
                <div key={refund.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(refund.status)}
                      <span className={`font-semibold ${
                        refund.status === 'pending' ? 'text-yellow-600' :
                        refund.status === 'approved' ? 'text-green-600' :
                        'text-red-600'
                      }`}>
                        {getStatusText(refund.status)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(refund.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Email:</p>
                      <p className="text-sm text-gray-600">{refund.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Valor:</p>
                      <p className="text-sm text-gray-600">R$ {refund.amount}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Método:</p>
                      <p className="text-sm text-gray-600">{refund.method}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">ID do Pagamento:</p>
                      <p className="text-sm text-gray-600">{refund.payment_id}</p>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700">Motivo:</p>
                    <p className="text-sm text-gray-600">{refund.reason}</p>
                  </div>
                  
                  {refund.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAction(refund.id, 'approve')}
                        disabled={processingId === refund.id}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        {processingId === refund.id ? 'Processando...' : 'Aprovar'}
                      </button>
                      <button
                        onClick={() => handleAction(refund.id, 'reject')}
                        disabled={processingId === refund.id}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        {processingId === refund.id ? 'Processando...' : 'Rejeitar'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
} 