'use client'

import { useState, useCallback, useMemo } from 'react'
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

  // Otimizar performance com useCallback
  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev)
  }, [])

  // Memoizar conteúdo para melhor performance
  const frontContent = useMemo(() => (
    <div className="text-center">
      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 px-4">
        {flashcard.front || 'Pergunta não disponível'}
      </h3>
      <p className="text-gray-600 text-sm px-4">
        Toque para ver a resposta
      </p>
    </div>
  ), [flashcard.front])

  const backContent = useMemo(() => (
    <div className="text-center">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 px-4">
        Resposta
      </h3>
      <p className="text-base sm:text-lg text-gray-700 mb-6 px-4 leading-relaxed">
        {flashcard.back || 'Resposta não disponível'}
      </p>
      {flashcard.explanation && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 mx-4">
          <h4 className="font-medium text-gray-900 mb-2">Explicação</h4>
          <p className="text-gray-700 text-sm leading-relaxed">
            {flashcard.explanation}
          </p>
        </div>
      )}
    </div>
  ), [flashcard.back, flashcard.explanation])

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Flashcard */}
      <motion.div
        className="relative cursor-pointer mobile-optimized"
        onClick={handleFlip}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 25,
          duration: 0.2
        }}
      >
        <div className="flashcard min-h-[300px] sm:min-h-[400px] flex flex-col justify-center performance-optimized">
          <AnimatePresence mode="wait">
            <motion.div
              key={isFlipped ? 'back' : 'front'}
              initial={{ 
                rotateY: isFlipped ? -90 : 90, 
                opacity: 0,
                scale: 0.95
              }}
              animate={{ 
                rotateY: 0, 
                opacity: 1,
                scale: 1
              }}
              exit={{ 
                rotateY: isFlipped ? 90 : -90, 
                opacity: 0,
                scale: 0.95
              }}
              transition={{ 
                duration: 0.4,
                ease: "easeInOut",
                type: "spring",
                stiffness: 200,
                damping: 20
              }}
              className="text-center performance-optimized"
              style={{
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden'
              }}
            >
              {!isFlipped ? frontContent : backContent}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Deepen Button */}
      {showDeepen && isFlipped && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mt-4 text-center"
        >
          <button
            onClick={onDeepen}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors touch-button mobile-accessible"
          >
            📚 Aprofundar Conteúdo
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Navigation Hint */}
      <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-500 px-4">
        <p className="mb-2">Use as setas do teclado para navegar</p>
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-1">
            <ChevronLeftIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Anterior</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="hidden sm:inline">Próximo</span>
            <ChevronRightIcon className="w-3 h-3 sm:w-4 sm:h-4" />
          </div>
        </div>
      </div>
    </div>
  )
} 