'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  CreditCardIcon,
  QrCodeIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline'

// Mock data para cursos
const mockCourses = {
  inss: {
    id: 'inss',
    name: 'INSS - Instituto Nacional do Seguro Social',
    description: 'Preparação completa para o concurso do INSS',
    price: 99.90,
    image: '/api/placeholder/400/200'
  },
  tj: {
    id: 'tj',
    name: 'TJ - Tribunal de Justiça',
    description: 'Concurso para cargos de técnico e analista judiciário',
    price: 99.90,
    image: '/api/placeholder/400/200'
  },
  pm: {
    id: 'pm',
    name: 'PM - Polícia Militar',
    description: 'Preparação para concursos de soldado e oficial da PM',
    price: 99.90,
    image: '/api/placeholder/400/200'
  }
}

export default function PaymentPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseId = searchParams.get('course')
  
  const [selectedCourse, setSelectedCourse] = useState(courseId ? mockCourses[courseId as keyof typeof mockCourses] : null)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending')
  const [pixQrCode, setPixQrCode] = useState('')
  const [pixCode, setPixCode] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    if (user.isPaid) {
      router.push('/dashboard')
      return
    }

    // Simular geração do PIX
    if (selectedCourse) {
      generatePixPayment()
    }
  }, [user, selectedCourse])

  const generatePixPayment = async () => {
    // Simular chamada para Mercado Pago
    setPaymentStatus('processing')
    
    setTimeout(() => {
      setPixQrCode('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
      setPixCode('00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426614174000520400005303986540510.005802BR5913FlashConCards6009SAO PAULO62070503***6304E2CA')
      setPaymentStatus('pending')
    }, 2000)
  }

  const handleCopyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(pixCode)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar código PIX:', err)
    }
  }

  const handleCourseSelect = (course: any) => {
    setSelectedCourse(course)
    setPaymentStatus('pending')
    setPixQrCode('')
    setPixCode('')
  }

  const handlePaymentSuccess = () => {
    setPaymentStatus('success')
    setTimeout(() => {
      router.push('/dashboard')
    }, 3000)
  }

  if (!user) {
    return null
  }

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
                <h1 className="text-2xl font-bold text-gray-900">Pagamento</h1>
                <p className="text-gray-600">Complete sua compra com PIX</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">Pagamento Seguro</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Seleção de Curso */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Escolha seu Curso</h2>
              <div className="space-y-4">
                {Object.values(mockCourses).map((course) => (
                  <div
                    key={course.id}
                    onClick={() => handleCourseSelect(course)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedCourse?.id === course.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={course.image}
                        alt={course.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{course.name}</h3>
                        <p className="text-sm text-gray-600">{course.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-lg font-bold text-primary-600">
                            R$ {course.price.toFixed(2).replace('.', ',')}
                          </span>
                          {selectedCourse?.id === course.id && (
                            <CheckCircleIcon className="w-5 h-5 text-primary-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Informações do Curso Selecionado */}
            {selectedCourse && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">O que você receberá:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircleIcon className="w-4 h-4 text-green-600 mr-2" />
                    Acesso completo ao curso {selectedCourse.name}
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="w-4 h-4 text-green-600 mr-2" />
                    Flashcards inteligentes com repetição espaçada
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="w-4 h-4 text-green-600 mr-2" />
                    Conteúdo de aprofundamento detalhado
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="w-4 h-4 text-green-600 mr-2" />
                    Dashboard de progresso em tempo real
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="w-4 h-4 text-green-600 mr-2" />
                    Acesso vitalício ao conteúdo
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Pagamento PIX */}
          <div className="space-y-6">
            {selectedCourse ? (
              <>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Pagamento PIX</h2>
                    <div className="flex items-center space-x-2">
                      <CreditCardIcon className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-gray-600">Mercado Pago</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{selectedCourse.name}</p>
                        <p className="text-sm text-gray-600">Acesso vitalício</p>
                      </div>
                      <span className="text-xl font-bold text-primary-600">
                        R$ {selectedCourse.price.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    {paymentStatus === 'processing' && (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Gerando código PIX...</p>
                      </div>
                    )}

                    {paymentStatus === 'pending' && pixQrCode && (
                      <div className="space-y-4">
                        <div className="text-center">
                          <h3 className="font-semibold text-gray-900 mb-2">Escaneie o QR Code</h3>
                          <div className="bg-white border-2 border-gray-200 rounded-lg p-4 inline-block">
                            <img
                              src={pixQrCode}
                              alt="QR Code PIX"
                              className="w-48 h-48 mx-auto"
                            />
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">Ou copie o código PIX</h3>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={pixCode}
                              readOnly
                              className="flex-1 input-field text-sm"
                            />
                            <button
                              onClick={handleCopyPixCode}
                              className="btn-outline px-4 py-2 text-sm"
                            >
                              {copySuccess ? 'Copiado!' : 'Copiar'}
                            </button>
                          </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center space-x-2">
                            <ClockIcon className="w-5 h-5 text-yellow-600" />
                            <div>
                              <p className="font-medium text-yellow-800">Aguardando pagamento</p>
                              <p className="text-sm text-yellow-700">
                                O pagamento será confirmado automaticamente em alguns segundos
                              </p>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={handlePaymentSuccess}
                          className="btn-primary w-full"
                        >
                          Simular Pagamento Confirmado
                        </button>
                      </div>
                    )}

                    {paymentStatus === 'success' && (
                      <div className="text-center py-8">
                        <CheckCircleIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Pagamento Confirmado!
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Seu acesso foi liberado. Redirecionando para o dashboard...
                        </p>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Informações de Segurança */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <ShieldCheckIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Pagamento Seguro</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Seus dados estão protegidos com criptografia SSL. O pagamento é processado pelo Mercado Pago, 
                        uma das maiores plataformas de pagamento do Brasil.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Selecione um Curso
                </h3>
                <p className="text-gray-600">
                  Escolha o curso que deseja comprar para continuar com o pagamento.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 