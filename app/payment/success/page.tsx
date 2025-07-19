'use client'

import { motion } from 'framer-motion'
import { CheckCircle, ArrowLeft, BookOpen } from 'lucide-react'
import Link from 'next/link'

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center shadow-2xl"
      >
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Pagamento Aprovado!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Parabéns! Seu pagamento foi processado com sucesso. 
          Agora você tem acesso completo ao FlashConCards para Policial Legislativo da ALEGO.
        </p>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center mb-2">
            <BookOpen className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800 font-semibold">Acesso Liberado</span>
          </div>
          <p className="text-green-700 text-sm">
            Você pode começar a estudar agora mesmo!
          </p>
        </div>
        
        <div className="space-y-3">
          <Link 
            href="/dashboard/paid" 
            className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Começar a Estudar
          </Link>
          
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