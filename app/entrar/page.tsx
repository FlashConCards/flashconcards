'use client'

import { motion } from 'framer-motion'
import { 
  BookOpen, 
  User, 
  CreditCard, 
  Play,
  ArrowLeft,
  CheckCircle
} from 'lucide-react'

export default function EntrarPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <a href="/" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-6 w-6" />
              </a>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Acessar FlashConCards
                </h1>
                <p className="text-sm text-gray-600">
                  Escolha como você quer acessar
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">FlashConCards</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Como você quer acessar?
          </h2>
          <p className="text-xl text-gray-600">
            Escolha a opção que melhor se adequa a você
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Login para Usuários Pagos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl p-8 shadow-sm border-2 border-primary-200 hover:border-primary-300 transition-colors duration-200"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Já sou cliente
              </h3>
              <p className="text-gray-600">
                Faça login se você já pagou e tem uma conta
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-sm text-gray-600">Acesso completo aos FlashConCards</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-sm text-gray-600">500+ cards organizados por matéria</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-sm text-gray-600">Registrar resultado do concurso</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-sm text-gray-600">Estatísticas de progresso</span>
              </div>
            </div>

            <a 
              href="/login" 
              className="w-full btn-primary py-3 inline-flex items-center justify-center"
            >
              <User className="h-5 w-5 mr-2" />
              Fazer Login
            </a>
          </motion.div>

          {/* Pagamento para Novos Usuários */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-xl p-8 shadow-sm border-2 border-green-200 hover:border-green-300 transition-colors duration-200"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Quero comprar agora
              </h3>
              <p className="text-gray-600">
                Faça o pagamento e tenha acesso completo
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-sm text-gray-600">Acesso por 12 meses</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-sm text-gray-600">Desconto especial de 75%</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-sm text-gray-600">Pagamento seguro via PIX ou cartão</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-sm text-gray-600">Suporte especializado</span>
              </div>
            </div>

            <a 
              href="/payment" 
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 inline-flex items-center justify-center"
            >
              <CreditCard className="h-5 w-5 mr-2" />
              Fazer Pagamento
            </a>
          </motion.div>
        </div>

        {/* Demo Option */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Play className="h-6 w-6 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Quer experimentar primeiro?
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Acesse uma versão demo gratuita para conhecer o sistema antes de comprar
            </p>
            <a 
              href="/dashboard" 
              className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
            >
              <Play className="h-4 w-4 mr-1" />
              Acessar Demo Gratuito
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 