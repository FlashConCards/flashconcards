'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle, ArrowLeft, DollarSign } from 'lucide-react'
import Link from 'next/link'

export default function RefundPage() {
  const [email, setEmail] = useState('')
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleRefund = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/payment/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, reason })
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: 'Erro ao processar reembolso' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center shadow-2xl"
      >
        <div className="flex items-center justify-center mb-6">
          <DollarSign className="h-8 w-8 text-green-500" />
          <span className="ml-2 text-xl font-bold text-gray-900">Solicitar Reembolso</span>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Cancelar Acesso e Solicitar Reembolso
        </h1>
        
        <p className="text-gray-600 mb-6">
          Preencha os dados abaixo para solicitar o cancelamento do acesso e reembolso do pagamento.
        </p>
        
        {result && (
          <div className={`p-4 rounded-lg mb-4 ${
            result.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {result.success ? (
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-green-700">{result.message}</span>
              </div>
            ) : (
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700">{result.error}</span>
              </div>
            )}
            {result.amount && (
              <p className="text-xs text-green-600 mt-1">
                Valor reembolsado: R$ {result.amount}
              </p>
            )}
          </div>
        )}
        
        <form onSubmit={handleRefund} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email usado no pagamento:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo do cancelamento:
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Descreva o motivo do cancelamento..."
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 transition-colors font-semibold disabled:opacity-50"
          >
            {isLoading ? 'Processando...' : 'Solicitar Reembolso'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Importante:</strong>
            </p>
            <ul className="text-xs text-yellow-700 mt-2 space-y-1">
              <li>• O reembolso será processado em até 5 dias úteis</li>
              <li>• O acesso será cancelado imediatamente</li>
              <li>• O valor será devolvido na forma original do pagamento</li>
            </ul>
          </div>
          
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar para página inicial
          </Link>
        </div>
      </motion.div>
    </div>
  )
} 