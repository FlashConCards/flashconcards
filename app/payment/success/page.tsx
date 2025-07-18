'use client'

import { motion } from 'framer-motion'
import { CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center"
      >
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Sistema Temporariamente Indisponível
        </h1>
        
        <p className="text-gray-600 mb-6">
          Estamos configurando o sistema. Volte em alguns minutos.
        </p>
        
        <Link 
          href="/" 
          className="inline-flex items-center text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar para página inicial
        </Link>
      </motion.div>
    </div>
  )
} 