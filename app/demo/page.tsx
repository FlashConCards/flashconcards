'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Lock, Eye, AlertTriangle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function DemoPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [demoData, setDemoData] = useState<any>(null)

  useEffect(() => {
    // Simular carregamento de dados do demo
    setTimeout(() => {
      setDemoData({
        totalFlashcards: 150,
        subjects: ['Direito Constitucional', 'Direito Administrativo', 'Direito Penal'],
        sampleFlashcards: [
          {
            question: 'O que é Poder Constituinte Originário?',
            answer: 'É o poder de criar uma nova Constituição, exercido por uma assembleia constituinte eleita pelo povo. É inicial, ilimitado, incondicionado e autônomo, não se submetendo a nenhuma norma anterior.',
            subject: 'Direito Constitucional'
          },
          {
            question: 'O que é Poder Difuso?',
            answer: 'É a competência de todos os juízes e tribunais para declarar a inconstitucionalidade de leis ou atos normativos em casos concretos. Qualquer juiz pode declarar uma lei inconstitucional no caso específico que está julgando.',
            subject: 'Direito Constitucional'
          },
          {
            question: 'O que são Normas de Princípio Programático?',
            answer: 'São normas constitucionais que estabelecem programas de ação para o Estado, indicando objetivos a serem alcançados. Não têm aplicação imediata, mas orientam a atuação dos poderes públicos.',
            subject: 'Direito Constitucional'
          }
        ]
      })
      setIsLoading(false)
    }, 1000)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center shadow-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando demonstração...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 mb-8 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">FlashConCards - DEMO</h1>
            </div>
            <div className="flex items-center bg-yellow-100 px-3 py-1 rounded-full">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mr-1" />
              <span className="text-sm text-yellow-800 font-semibold">VERSÃO DEMO</span>
            </div>
          </div>
          
          <p className="text-gray-600 mb-4">
            Esta é uma demonstração limitada do FlashConCards. Para acessar todo o conteúdo, 
            faça seu cadastro e pagamento.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{demoData?.totalFlashcards}</div>
              <div className="text-sm text-blue-800">Flashcards Disponíveis</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{demoData?.subjects?.length}</div>
              <div className="text-sm text-green-800">Matérias</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">3</div>
              <div className="text-sm text-purple-800">Exemplos Visíveis</div>
            </div>
          </div>
        </motion.div>

        {/* Demo Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 mb-8 shadow-2xl"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Eye className="h-5 w-5 text-blue-600 mr-2" />
            Exemplos de Flashcards - Direito Constitucional
          </h2>
          
          <div className="space-y-4">
            {demoData?.sampleFlashcards?.map((flashcard: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {flashcard.subject}
                  </span>
                  <span className="text-xs text-gray-500">Exemplo {index + 1}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{flashcard.question}</h3>
                <p className="text-gray-600 text-sm">{flashcard.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-6 text-white shadow-2xl"
        >
          <div className="text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Acesse o Conteúdo Completo!</h2>
            <p className="text-green-100 mb-6">
              Desbloqueie mais de 150 flashcards organizados por matéria, 
              com questões específicas para Policial Legislativo da ALEGO.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white bg-opacity-20 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">✅ O que você ganha:</h3>
                <ul className="text-sm space-y-1">
                  <li>• 150+ flashcards organizados</li>
                  <li>• Questões específicas ALEGO</li>
                  <li>• Acesso ilimitado</li>
                  <li>• Suporte completo</li>
                </ul>
              </div>
              <div className="bg-white bg-opacity-20 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">🎯 Matérias incluídas:</h3>
                <ul className="text-sm space-y-1">
                  <li>• Direito Constitucional</li>
                  <li>• Direito Administrativo</li>
                  <li>• Direito Penal</li>
                  <li>• E muito mais!</li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-3">
              <Link 
                href="/payment"
                className="block w-full bg-white text-blue-600 py-3 px-6 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Fazer Cadastro e Pagamento
              </Link>
              
              <Link 
                href="/"
                className="block w-full bg-transparent border border-white text-white py-2 px-6 rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                Voltar para Página Inicial
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 