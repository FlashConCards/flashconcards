'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { Flashcard as FlashcardType } from '@/types'

// Dados mockados para demonstração - cards que foram errados
const mockReviewCards: FlashcardType[] = [
  {
    id: '1',
    subTopicId: '1',
    front: 'O que é o princípio da isonomia?',
    back: 'Todos são iguais perante a lei, sem distinção de qualquer natureza.',
    explanation: 'O princípio da isonomia garante que todos os cidadãos tenham tratamento igual perante a lei, sem discriminações.',
    order: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    subTopicId: '2',
    front: 'Qual é a diferença entre eficácia e eficiência na Administração Pública?',
    back: 'Eficácia é atingir o objetivo proposto, enquanto eficiência é atingir o objetivo com o menor custo possível.',
    explanation: 'A eficácia foca no resultado, enquanto a eficiência considera também os meios utilizados para alcançar o resultado.',
    order: 2,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    subTopicId: '3',
    front: 'O que é o princípio da irretroatividade da lei?',
    back: 'A lei não pode retroagir para prejudicar o direito adquirido, o ato jurídico perfeito e a coisa julgada.',
    explanation: 'Este princípio protege a segurança jurídica, impedindo que leis novas afetem situações já consolidadas.',
    order: 3,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export default function ReviewPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [showButtons, setShowButtons] = useState(false)
  const [reviewResults, setReviewResults] = useState<{
    correct: number
    wrong: number
    total: number
  }>({
    correct: 0,
    wrong: 0,
    total: mockReviewCards.length,
  })

  const currentCard = mockReviewCards[currentCardIndex]

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
    if (!isFlipped) {
      setShowButtons(true)
    }
  }

  const handleAnswer = (status: 'learned' | 'wrong') => {
    setReviewResults(prev => ({
      ...prev,
      [status === 'learned' ? 'correct' : 'wrong']: prev[status === 'learned' ? 'correct' : 'wrong'] + 1
    }))
    
    setIsFlipped(false)
    setShowButtons(false)
    
    // Avançar para o próximo card
    if (currentCardIndex < mockReviewCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
    }
  }

  const nextCard = () => {
    if (currentCardIndex < mockReviewCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
      setIsFlipped(false)
      setShowButtons(false)
    }
  }

  const previousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1)
      setIsFlipped(false)
      setShowButtons(false)
    }
  }

  const resetReview = () => {
    setCurrentCardIndex(0)
    setIsFlipped(false)
    setShowButtons(false)
    setReviewResults({
      correct: 0,
      wrong: 0,
      total: mockReviewCards.length,
    })
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h2>
          <p className="text-gray-600 mb-4">Você precisa estar logado para acessar esta página.</p>
          <button
            onClick={() => router.push('/login')}
            className="btn-primary"
          >
            Fazer Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
                  Revisão de Erros
                </h1>
                <p className="text-sm text-gray-600">
                  Card {currentCardIndex + 1} de {mockReviewCards.length}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={resetReview}
                className="btn-outline text-sm"
              >
                Reiniciar Revisão
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="mb-8">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{reviewResults.correct}</div>
              <div className="text-sm text-gray-600">Corrigidos</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{reviewResults.wrong}</div>
              <div className="text-sm text-gray-600">Ainda Errados</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary-600">{reviewResults.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </div>

        {/* Flashcard */}
        <div className="mb-8">
          <div 
            className="flashcard min-h-[500px] flex flex-col justify-center cursor-pointer border-2 border-yellow-200"
            onClick={handleFlip}
          >
            <div className="text-center">
              {!isFlipped ? (
                <div>
                  <div className="mb-4 flex justify-center">
                    <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {currentCard.front}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Toque para ver a resposta correta
                  </p>

                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Resposta Correta
                  </h3>
                  <p className="text-lg text-gray-700 mb-6">
                    {currentCard.back}
                  </p>
                  {currentCard.explanation && (
                    <div className="bg-yellow-50 rounded-lg p-4 mb-6 border border-yellow-200">
                      <h4 className="font-medium text-gray-900 mb-2">Explicação</h4>
                      <p className="text-gray-700 text-sm">
                        {currentCard.explanation}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {showButtons && isFlipped && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <button
              onClick={() => handleAnswer('wrong')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              <XCircleIcon className="w-5 h-5" />
              Ainda Errei
            </button>
            
            <button
              onClick={() => handleAnswer('learned')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              <CheckCircleIcon className="w-5 h-5" />
              Agora Aprendi
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={previousCard}
            disabled={currentCardIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon className="w-5 h-5" />
            Anterior
          </button>
          
          <div className="text-sm text-gray-600">
            {currentCardIndex + 1} de {mockReviewCards.length}
          </div>
          
          <button
            onClick={nextCard}
            disabled={currentCardIndex === mockReviewCards.length - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próximo
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-8">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${((currentCardIndex + 1) / mockReviewCards.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Completion Message */}
        {currentCardIndex === mockReviewCards.length - 1 && reviewResults.correct + reviewResults.wrong === reviewResults.total && (
          <div className="mt-8 text-center">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Revisão Concluída!</h3>
              <p className="text-gray-600 mb-4">
                Você corrigiu {reviewResults.correct} de {reviewResults.total} cards.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => router.push('/study')}
                  className="btn-primary"
                >
                  Continuar Estudando
                </button>
                <button
                  onClick={resetReview}
                  className="btn-outline"
                >
                  Revisar Novamente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 