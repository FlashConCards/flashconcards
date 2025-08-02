'use client'

import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import RatingStars from './RatingStars'
import toast from 'react-hot-toast'

interface TestimonialModalProps {
  isOpen: boolean
  onClose: () => void
  userId?: string
  userName?: string
  userEmail?: string
}

export default function TestimonialModal({
  isOpen,
  onClose,
  userId,
  userName,
  userEmail
}: TestimonialModalProps) {
  const [rating, setRating] = useState(0)
  const [name, setName] = useState(userName || '')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      toast.error('Por favor, selecione uma avaliação')
      return
    }

    if (!name.trim()) {
      toast.error('Por favor, informe seu nome')
      return
    }

    if (!content.trim()) {
      toast.error('Por favor, escreva seu depoimento')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/testimonials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          content: content.trim(),
          rating,
          userId,
          userEmail
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
        onClose()
        // Reset form
        setRating(0)
        setName(userName || '')
        setContent('')
      } else {
        toast.error(data.error || 'Erro ao enviar depoimento')
      }
    } catch (error) {
      console.error('Error submitting testimonial:', error)
      toast.error('Erro ao enviar depoimento')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Deixe seu Depoimento
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Compartilhe sua experiência com a plataforma FlashConCards:
            </p>
          </div>

          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Seu Nome *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Digite seu nome"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Avaliação da Plataforma *
            </label>
            <RatingStars
              rating={rating}
              onRatingChange={setRating}
              size="lg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Clique nas estrelas para avaliar (1-5 estrelas)
            </p>
          </div>

          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Seu Depoimento *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Conte-nos sobre sua experiência com a plataforma..."
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || rating === 0 || !name.trim() || !content.trim()}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando...' : 'Enviar Depoimento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 