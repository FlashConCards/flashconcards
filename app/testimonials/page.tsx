'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import {
  StarIcon,
  UserCircleIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  PaperAirplaneIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'

interface Testimonial {
  id: string
  name: string
  role: string
  content: string
  rating: number
  course: string
  createdAt: Date
  isApproved: boolean
}

// Mock testimonials
const mockTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Maria Silva',
    role: 'Aprovada no INSS',
    content: 'Os flashcards me ajudaram muito! Consegui memorizar todo o conteúdo de forma eficiente.',
    rating: 5,
    course: 'INSS',
    createdAt: new Date('2024-01-15'),
    isApproved: true
  },
  {
    id: '2',
    name: 'João Santos',
    role: 'Aprovado no TJ',
    content: 'A plataforma é incrível! O sistema de repetição espaçada fez toda a diferença.',
    rating: 5,
    course: 'TJ',
    createdAt: new Date('2024-01-14'),
    isApproved: true
  },
  {
    id: '3',
    name: 'Ana Costa',
    role: 'Aprovada na PM',
    content: 'Conteúdo de qualidade e interface intuitiva. Recomendo para todos!',
    rating: 5,
    course: 'PM',
    createdAt: new Date('2024-01-13'),
    isApproved: true
  }
]

export default function TestimonialsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [testimonials, setTestimonials] = useState<Testimonial[]>(mockTestimonials)
  const [showForm, setShowForm] = useState(false)
  const [newTestimonial, setNewTestimonial] = useState({
    content: '',
    rating: 5,
    course: '',
    role: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmitTestimonial = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    if (!user.isPaid) {
      alert('Apenas usuários que adquiriram nossos cursos podem deixar depoimentos.')
      router.push('/payment')
      return
    }

    if (!newTestimonial.content.trim() || !newTestimonial.course || !newTestimonial.role) {
      alert('Por favor, preencha todos os campos.')
      return
    }

    setSubmitting(true)

    // Simular envio
    setTimeout(() => {
      const testimonial: Testimonial = {
        id: Date.now().toString(),
        name: user.displayName,
        role: newTestimonial.role,
        content: newTestimonial.content,
        rating: newTestimonial.rating,
        course: newTestimonial.course,
        createdAt: new Date(),
        isApproved: false // Aguarda aprovação do admin
      }

      setTestimonials([testimonial, ...testimonials])
      setNewTestimonial({ content: '', rating: 5, course: '', role: '' })
      setShowForm(false)
      setSubmitting(false)

      alert('Seu depoimento foi enviado e será revisado antes de ser publicado. Obrigado!')
    }, 2000)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  const approvedTestimonials = testimonials.filter(t => t.isApproved)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="btn-outline flex items-center gap-2"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Voltar
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Depoimentos</h1>
                <p className="text-gray-600">Histórias reais de sucesso dos nossos alunos</p>
              </div>
            </div>
            {user && user.isPaid && (
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary flex items-center gap-2"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
                Deixar Depoimento
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introdução */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            O que nossos alunos dizem
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Histórias reais de sucesso de quem confiou na nossa plataforma e conquistou a aprovação
          </p>
        </div>

        {/* Depoimentos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {approvedTestimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <UserCircleIcon className="w-6 h-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                  <p className="text-sm text-primary-600">{testimonial.role}</p>
                </div>
              </div>
              
              <div className="flex items-center mb-3">
                {renderStars(testimonial.rating)}
                <span className="ml-2 text-sm text-gray-600">({testimonial.rating}/5)</span>
              </div>
              
              <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Curso: {testimonial.course}</span>
                <span>{testimonial.createdAt.toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA para deixar depoimento */}
        {!showForm && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Compartilhe sua experiência
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Se você já estudou conosco e foi aprovado, deixe seu depoimento para inspirar outros estudantes.
              Sua história pode fazer a diferença na vida de alguém!
            </p>
            
            {!user ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2 text-gray-600 mb-4">
                  <LockClosedIcon className="w-5 h-5" />
                  <span>Apenas usuários logados podem deixar depoimentos</span>
                </div>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => router.push('/login')}
                    className="btn-outline"
                  >
                    Fazer Login
                  </button>
                  <button
                    onClick={() => router.push('/register')}
                    className="btn-primary"
                  >
                    Criar Conta
                  </button>
                </div>
              </div>
            ) : !user.isPaid ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2 text-gray-600 mb-4">
                  <LockClosedIcon className="w-5 h-5" />
                  <span>Apenas usuários que adquiriram nossos cursos podem deixar depoimentos</span>
                </div>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => router.push('/payment')}
                    className="btn-primary"
                  >
                    Ver Cursos Disponíveis
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary flex items-center gap-2 mx-auto"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
                Deixar meu Depoimento
              </button>
            )}
          </div>
        )}

        {/* Formulário de Depoimento */}
        {showForm && user && user.isPaid && (
          <div className="bg-white rounded-lg shadow-sm p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Deixe seu Depoimento
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conteúdo do Depoimento
                </label>
                <textarea
                  value={newTestimonial.content}
                  onChange={(e) => setNewTestimonial({...newTestimonial, content: e.target.value})}
                  className="input-field"
                  rows={4}
                  placeholder="Conte como o FlashConCards te ajudou na sua aprovação..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Avaliação
                </label>
                <div className="flex items-center space-x-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setNewTestimonial({...newTestimonial, rating: i + 1})}
                      className="focus:outline-none"
                    >
                      <StarIcon
                        className={`w-8 h-8 ${
                          i < newTestimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">({newTestimonial.rating}/5)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Concurso Aprovado
                  </label>
                  <select
                    value={newTestimonial.course}
                    onChange={(e) => setNewTestimonial({...newTestimonial, course: e.target.value})}
                    className="input-field"
                  >
                    <option value="">Selecione o concurso</option>
                    <option value="INSS">INSS</option>
                    <option value="TJ">TJ - Tribunal de Justiça</option>
                    <option value="PM">PM - Polícia Militar</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cargo/Posição
                  </label>
                  <input
                    type="text"
                    value={newTestimonial.role}
                    onChange={(e) => setNewTestimonial({...newTestimonial, role: e.target.value})}
                    className="input-field"
                    placeholder="Ex: Aprovado no INSS"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Informação Importante</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Seu depoimento será revisado pela nossa equipe antes de ser publicado. 
                      Apenas depoimentos genuínos e construtivos serão aprovados.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowForm(false)}
                  className="btn-outline"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitTestimonial}
                  disabled={submitting}
                  className="btn-primary flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="w-5 h-5" />
                      Enviar Depoimento
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 