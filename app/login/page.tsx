'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  User, 
  Mail, 
  Lock, 
  ArrowLeft,
  Eye,
  EyeOff
} from 'lucide-react'
import { usersData } from '../lib/data'
import { loginUser } from '../lib/auth'
import { isUserPaid } from '../lib/supabase'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Verificar se o usuário fez pagamento
    setTimeout(async () => {
      // Verificar se o email fez pagamento
      const userPaid = await isUserPaid(formData.email)
      if (userPaid) {
        // Usuário pagou - verificar senha
        if (formData.password === 'flashconcards123') {
          // Login bem-sucedido
          loginUser({
            id: 'paid-user',
            name: formData.email.split('@')[0], // Usar parte do email como nome
            email: formData.email,
            isActive: true
          })
          window.location.href = '/dashboard/paid'
        } else {
          setError('Senha incorreta. Use a senha padrão: flashconcards123')
        }
      } else {
        // Usuário não pagou - verificar se é um usuário demo
        const user = usersData.find(u => 
          u.email === formData.email && 
          u.isActive === true
        )

        if (user && formData.password === 'flashconcards123') {
          // Usuário demo - acesso limitado
          loginUser({
            id: user.id,
            name: user.name,
            email: user.email,
            isActive: user.isActive
          })
          window.location.href = '/dashboard'
        } else {
          setError('Email não encontrado ou pagamento não realizado. Faça o pagamento primeiro.')
        }
      }
      
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-8 max-w-md w-full mx-4"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 text-primary-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">FlashConCards</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Acesse sua conta
          </h1>
          <p className="text-gray-600">
            Faça login para acessar seus FlashConCards
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="flashconcards123"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Help Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Precisa de ajuda?</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• Senha padrão: <code className="bg-blue-100 px-1 rounded">flashconcards123</code></p>
            <p>• Ainda não tem conta? <a href="/payment" className="underline">Faça o pagamento</a></p>
            <p>• Esqueceu a senha? Use a senha padrão</p>
          </div>
        </div>

        {/* Demo Access */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Quer experimentar?</h3>
          <p className="text-sm text-gray-600 mb-3">
            Acesse uma versão demo gratuita para conhecer o sistema.
          </p>
          <a 
            href="/dashboard" 
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Acessar Demo →
          </a>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <a 
            href="/" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar para página inicial
          </a>
        </div>
      </motion.div>
    </div>
  )
} 