'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, User, Mail, Lock, ArrowRight } from 'lucide-react'
import { addUser } from '../../lib/data'
import { loginUser } from '../../lib/auth'
// import { simulatePaymentApproval } from '../../lib/supabase'

export default function PaymentSuccessPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email) {
      alert('Por favor, preencha todos os campos.')
      return
    }

    // Registrar pagamento para o email
    // simulatePaymentApproval(formData.email, 'success-payment')

    // Adicionar usuário aos dados
    const newUser = addUser({
      name: formData.name,
      email: formData.email,
      isActive: true,
      joinedAt: new Date()
    })

    // Fazer login do usuário
    loginUser({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      isActive: newUser.isActive
    })

    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center"
        >
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Cadastro Concluído!
          </h1>
          <p className="text-gray-600 mb-6">
            Seu acesso foi liberado com sucesso.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Suas Credenciais:</h3>
            <div className="text-left space-y-2">
              <div>
                <span className="text-sm text-gray-600">Email:</span>
                <div className="font-mono text-sm bg-white p-2 rounded border">
                  {formData.email}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Senha:</span>
                <div className="font-mono text-sm bg-white p-2 rounded border">
                  flashconcards123
                </div>
              </div>
            </div>
          </div>
          
          <a 
            href="/dashboard/paid" 
            className="btn-primary inline-flex items-center"
          >
            Acessar FlashConCards
            <ArrowRight className="ml-2 h-5 w-5" />
          </a>
          
          <p className="text-sm text-gray-500 mt-4">
            Ao continuar, você concorda com nossos{' '}
            <a href="/termos" className="text-primary-600 hover:underline">Termos de Uso</a>
            {' '}e{' '}
            <a href="/privacidade" className="text-primary-600 hover:underline">Política de Privacidade</a>.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-8 max-w-md w-full mx-4"
      >
        <div className="text-center mb-6">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Pagamento Aprovado!
          </h1>
          <p className="text-gray-600">
            Agora complete seu cadastro para acessar o FlashConCards
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Seu nome completo"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start">
              <Lock className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Senha Padrão</p>
                <p className="font-mono mt-1">flashconcards123</p>
                <p className="mt-2">Você poderá alterar sua senha após o primeiro acesso.</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full btn-primary py-3"
          >
            Completar Cadastro
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Ao completar o cadastro, você concorda com nossos{' '}
            <a href="#" className="text-primary-600 hover:underline">Termos de Uso</a>
          </p>
        </div>
      </motion.div>
    </div>
  )
} 