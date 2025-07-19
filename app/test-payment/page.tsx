'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle } from 'lucide-react'

export default function TestPaymentPage() {
  const [email, setEmail] = useState('claudioghabryel.cg@gmail.com')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const simulatePayment = async () => {
    setIsLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/payment/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: 'Erro ao simular pagamento' })
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
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Teste de Pagamento
        </h1>
        
        <p className="text-gray-600 mb-6">
          Simule um pagamento aprovado para testar o sistema
        </p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email:
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <button
          onClick={simulatePayment}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 mb-4"
        >
          {isLoading ? 'Simulando...' : 'Simular Pagamento Aprovado'}
        </button>
        
        {result && (
          <div className={`p-4 rounded-lg ${
            result.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {result.success ? (
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-green-700">Pagamento simulado com sucesso!</span>
              </div>
            ) : (
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700">{result.error}</span>
              </div>
            )}
          </div>
        )}
        
        {result?.success && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Agora você pode fazer login com:
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Email: {email}
            </p>
            <p className="text-sm text-blue-600">
              Senha: souflashconcards
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
} 