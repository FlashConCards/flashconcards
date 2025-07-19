'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, Zap } from 'lucide-react'

export default function ForceTestPage() {
  const [email, setEmail] = useState('claudioghabryel.cg@gmail.com')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const forceApprove = async () => {
    setIsLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/payment/force-approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        // Aguardar um pouco e redirecionar
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
      }
    } catch (error) {
      setResult({ error: 'Erro ao forçar aprovação' })
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
          <Zap className="h-8 w-8 text-yellow-500" />
          <span className="ml-2 text-xl font-bold text-gray-900">FORÇAR APROVAÇÃO</span>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Teste Forçado
        </h1>
        
        <p className="text-gray-600 mb-6">
          Vou FORÇAR a aprovação do pagamento para garantir que funcione!
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
          onClick={forceApprove}
          disabled={isLoading}
          className="w-full bg-yellow-500 text-white py-3 px-4 rounded-lg hover:bg-yellow-600 transition-colors font-semibold disabled:opacity-50 mb-4"
        >
          {isLoading ? 'FORÇANDO...' : 'FORÇAR APROVAÇÃO AGORA!'}
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
                <span className="text-green-700">{result.message}</span>
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
              Redirecionando para login em 2 segundos...
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