'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckIcon, 
  XMarkIcon, 
  ClockIcon, 
  ChevronRightIcon,
  ChevronLeftIcon 
} from '@heroicons/react/24/outline'
import { Flashcard as FlashcardType } from '@/types'

interface FlashcardProps {
  flashcard: FlashcardType
  onAnswer: (status: 'learned' | 'wrong') => void
  onDeepen: () => void
  showDeepen?: boolean
}

export default function Flashcard({ 
  flashcard, 
  onAnswer, 
  onDeepen, 
  showDeepen = true 
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Flashcard */}
      <motion.div
        className="relative cursor-pointer"
        onClick={handleFlip}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flashcard min-h-[400px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={isFlipped ? 'back' : 'front'}
              initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              {!isFlipped ? (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {flashcard.front || 'Pergunta não disponível'}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Toque para ver a resposta
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Resposta
                  </h3>
                  <p className="text-lg text-gray-700 mb-6">
                    {flashcard.back || 'Resposta não disponível'}
                  </p>
                  {flashcard.explanation && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <h4 className="font-medium text-gray-900 mb-2">Explicação</h4>
                      <p className="text-gray-700 text-sm">
                        {flashcard.explanation}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Deepen Button */}
      {showDeepen && isFlipped && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-center"
        >
          <button
            onClick={onDeepen}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            📚 Aprofundar Conteúdo
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Navigation Hint */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Use as setas do teclado para navegar</p>
        <div className="flex items-center justify-center gap-4 mt-2">
          <div className="flex items-center gap-1">
            <ChevronLeftIcon className="w-4 h-4" />
            <span>Anterior</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Próximo</span>
            <ChevronRightIcon className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  )
} 