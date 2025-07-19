'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, Send, CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function FeedbackPage() {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Verificar se usuário está logado
    const userData = localStorage.getItem('flashconcards_user')
    if (!userData) {
      window.location.href = '/login'
      return
    }

    const userInfo = JSON.parse(userData)
    setUser(userInfo)
    setName(userInfo.name || '')
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      alert('Por favor, selecione uma avaliação')
      return
    }

    if (!comment.trim()) {
      alert('Por favor, escreva um comentário')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/user/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          rating,
          comment: comment.trim(),
          name: name.trim()
        })
      })

      if (response.ok) {
        setIsSubmitted(true)
        setRating(0)
        setComment('')
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao enviar feedback')
      }
    } catch (error) {
      console.error('Erro ao enviar feedback:', error)
      alert('Erro ao enviar feedback. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center shadow-2xl">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Feedback Enviado!
          </h1>
          <p className="text-gray-600 mb-6">
            Obrigado por compartilhar sua experiência conosco. Seu feedback ajuda outros alunos!
          </p>
          <Link 
            href="/dashboard/paid"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link 
              href="/dashboard/paid"
              className="inline-flex items-center text-white hover:text-blue-200 mb-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar ao Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white mb-4">
              Compartilhe sua experiência
            </h1>
            <p className="text-blue-100">
              Ajude outros alunos compartilhando sua experiência com o FlashConCards
            </p>
          </div>

          {/* Feedback Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-8 shadow-2xl"
          >
            <form onSubmit={handleSubmit}>
              {/* Rating */}
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">
                  Como você avalia sua experiência?
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star 
                        className={`h-8 w-8 ${
                          star <= rating 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {rating === 0 && 'Selecione uma avaliação'}
                  {rating === 1 && 'Péssimo'}
                  {rating === 2 && 'Ruim'}
                  {rating === 3 && 'Regular'}
                  {rating === 4 && 'Bom'}
                  {rating === 5 && 'Excelente'}
                </p>
              </div>

              {/* Name */}
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">
                  Seu nome (opcional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Como você gostaria de ser identificado"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Comment */}
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">
                  Seu depoimento *
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Conte como o FlashConCards te ajudou nos estudos..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || rating === 0 || !comment.trim()}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Enviar Feedback
                  </>
                )}
              </button>
            </form>

            {/* Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Importante:</strong> Apenas usuários que pagaram podem deixar feedback. 
                Seu depoimento será exibido na página inicial para ajudar outros alunos.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
} 