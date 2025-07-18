'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Calendar, Star } from 'lucide-react'

interface ExamResultFormProps {
  onSubmit: (passed: boolean, examDate: Date, rating?: number, feedback?: string) => void
  onClose: () => void
}

export default function ExamResultForm({ onSubmit, onClose }: ExamResultFormProps) {
  const [passed, setPassed] = useState<boolean | null>(null)
  const [examDate, setExamDate] = useState('')
  const [rating, setRating] = useState(5)
  const [feedback, setFeedback] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passed === null || !examDate) {
      alert('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    const date = new Date(examDate)
    onSubmit(passed, date, rating, feedback)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Resultado do Concurso ALEGO
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Status de Aprovação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Você foi aprovado(a) no concurso?
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setPassed(true)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-colors ${
                    passed === true
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-green-500'
                  }`}
                >
                  <CheckCircle className="h-5 w-5" />
                  Sim, passei!
                </button>
                <button
                  type="button"
                  onClick={() => setPassed(false)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-colors ${
                    passed === false
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-300 hover:border-red-500'
                  }`}
                >
                  <XCircle className="h-5 w-5" />
                  Não, mas vou tentar novamente
                </button>
              </div>
            </div>

            {/* Data do Concurso */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data do concurso
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
            </div>

            {/* Feedback Opcional */}
            <div>
              <button
                type="button"
                onClick={() => setShowFeedback(!showFeedback)}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                {showFeedback ? 'Ocultar' : 'Adicionar'} feedback (opcional)
              </button>
            </div>

            {showFeedback && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                {/* Avaliação */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Como você avalia o FlashConCards?
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`p-1 ${
                          star <= rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        <Star className="h-6 w-6 fill-current" />
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {rating === 1 && 'Muito ruim'}
                    {rating === 2 && 'Ruim'}
                    {rating === 3 && 'Regular'}
                    {rating === 4 && 'Bom'}
                    {rating === 5 && 'Excelente'}
                  </p>
                </div>

                {/* Comentário */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seu comentário (opcional)
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Conte-nos sua experiência com o FlashConCards..."
                  />
                </div>
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Enviar Resultado
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 