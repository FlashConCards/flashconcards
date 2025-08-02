'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import RatingStars from './RatingStars'
import toast from 'react-hot-toast'

interface CourseRatingModalProps {
  isOpen: boolean
  onClose: () => void
  courseId: string
  courseName: string
  userId: string
  userName: string
  userEmail: string
}

export default function CourseRatingModal({
  isOpen,
  onClose,
  courseId,
  courseName,
  userId,
  userName,
  userEmail
}: CourseRatingModalProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [existingRating, setExistingRating] = useState<any>(null)

  useEffect(() => {
    if (isOpen && courseId && userId) {
      loadExistingRating()
    }
  }, [isOpen, courseId, userId])

  const loadExistingRating = async () => {
    try {
      const response = await fetch(`/api/course-ratings?courseId=${courseId}&userId=${userId}`)
      const data = await response.json()
      
      if (data && data.rating) {
        setExistingRating(data)
        setRating(data.rating)
        setComment(data.comment || '')
      }
    } catch (error) {
      console.error('Error loading existing rating:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      toast.error('Por favor, selecione uma avaliação')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/course-ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          courseId,
          rating,
          comment,
          userName,
          userEmail
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
        onClose()
        // Reset form
        setRating(0)
        setComment('')
        setExistingRating(null)
      } else {
        toast.error(data.error || 'Erro ao enviar avaliação')
      }
    } catch (error) {
      console.error('Error submitting rating:', error)
      toast.error('Erro ao enviar avaliação')
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
            {existingRating ? 'Editar Avaliação' : 'Avaliar Curso'}
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {courseName}
            </h3>
            <p className="text-sm text-gray-600">
              {existingRating ? 'Edite sua avaliação do curso:' : 'Como você avalia este curso?'}
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Avaliação
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
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Comentário (opcional)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Compartilhe sua experiência com este curso..."
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
              disabled={loading || rating === 0}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando...' : existingRating ? 'Atualizar' : 'Enviar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 