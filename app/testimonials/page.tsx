'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeftIcon,
  UserGroupIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { getTestimonials } from '@/lib/firebase'
import TestimonialModal from '@/components/TestimonialModal'
import toast from 'react-hot-toast'

interface Testimonial {
  id: string
  name: string
  content: string
  rating: number
  course?: string
  createdAt: any
}

export default function TestimonialsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [showTestimonialModal, setShowTestimonialModal] = useState(false)

  const loadTestimonials = async () => {
    try {
      setLoading(true)
      const testimonialsData = await getTestimonials('approved')
      setTestimonials(testimonialsData || [])
    } catch (error) {
      console.error('Error loading testimonials:', error)
      toast.error('Erro ao carregar depoimentos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTestimonials()
  }, [])

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando depoimentos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <button
              onClick={() => router.push('/')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Voltar
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Depoimentos</h1>
            <button
              onClick={() => setShowTestimonialModal(true)}
              className="btn-primary"
            >
              Deixar Depoimento
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {testimonials.length === 0 ? (
          <div className="text-center py-12">
            <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum depoimento ainda
            </h2>
            <p className="text-gray-600 mb-6">
              Seja o primeiro a compartilhar sua experiência com a plataforma!
            </p>
            <button
              onClick={() => setShowTestimonialModal(true)}
              className="btn-primary"
            >
              Deixar Meu Depoimento
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    <UserGroupIcon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {testimonial.course || 'Estudante'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center mb-3">
                  {renderStars(testimonial.rating)}
                </div>

                <p className="text-gray-700 mb-4 italic">
                  "{testimonial.content}"
                </p>

                <div className="text-xs text-gray-500">
                  {formatDate(testimonial.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Testimonial */}
      {showTestimonialModal && (
        <TestimonialModal
          isOpen={showTestimonialModal}
          onClose={() => {
            setShowTestimonialModal(false);
            // Recarregar testimonials após enviar
            loadTestimonials();
          }}
          userId={user?.uid}
          userName={user?.displayName || ''}
          userEmail={user?.email || ''}
        />
      )}
    </div>
  )
} 