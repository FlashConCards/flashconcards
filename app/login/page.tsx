'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, ArrowLeft, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simular login (por enquanto)
    setTimeout(() => {
      setIsLoading(false)
      // Redirecionar para dashboard
      window.location.href = '/dashboard/paid'
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center shadow-2xl"
      >
        <div className="flex items-center justify-center mb-6">
          <BookOpen className="h-8 w-8 text-blue-600" />
          <span className="ml-2 text-xl font-bold text-gray-900">FlashConCards</span>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Acesse sua conta
        </h1>
        
        <p className="text-gray-600 mb-6">
          Entre com suas credenciais para acessar o sistema
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                placeholder="Seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>
          
          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Não tem uma conta? 
            <Link href="/payment" className="text-blue-600 hover:text-blue-700 font-semibold ml-1">
              Faça seu cadastro
            </Link>
          </p>
          
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