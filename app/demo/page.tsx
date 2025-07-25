'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Target, 
  TrendingUp, 
  User, 
  LogOut,
  Play,
  CheckCircle,
  Clock,
  BarChart3,
  ArrowRight,
  Trophy,
  MessageSquare,
  Star,
  Zap,
  FileText,
  Users,
  Calendar,
  X
} from 'lucide-react'
import Link from 'next/link'

interface Subject {
  id: string
  name: string
  description: string
  totalCards: number
  completedCards: number
  icon: any
  color: string
}

export default function DemoPage() {
  const [demoStats, setDemoStats] = useState({
    totalCards: 500,
    cardsStudied: 0,
    sessionsToday: 0,
    timeStudied: 0,
    subjects: 6,
    demoProgress: 25
  })

  const subjects: Subject[] = [
    {
      id: 'portugues',
      name: 'Língua Portuguesa',
      description: 'Compreensão, interpretação e gramática',
      totalCards: 120,
      completedCards: 0,
      icon: BookOpen,
      color: 'bg-blue-500'
    },
    {
      id: 'informatica',
      name: 'Noções de Informática',
      description: 'Sistemas operacionais e pacote Office',
      totalCards: 80,
      completedCards: 0,
      icon: Target,
      color: 'bg-green-500'
    },
    {
      id: 'constitucional',
      name: 'Direito Constitucional',
      description: 'Constituição e direitos fundamentais',
      totalCards: 150,
      completedCards: 0,
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
    {
      id: 'administrativo',
      name: 'Direito Administrativo',
      description: 'Administração pública e atos administrativos',
      totalCards: 130,
      completedCards: 0,
      icon: BarChart3,
      color: 'bg-orange-500'
    },
    {
      id: 'realidade-goias',
      name: 'Realidade de Goiás',
      description: 'História, cultura e geografia do estado',
      totalCards: 90,
      completedCards: 0,
      icon: Clock,
      color: 'bg-red-500'
    },
    {
      id: 'legislacao-alego',
      name: 'Legislação ALEGO',
      description: 'Regimento interno e estrutura legislativa',
      totalCards: 70,
      completedCards: 0,
      icon: CheckCircle,
      color: 'bg-indigo-500'
    }
  ]

  const getProgressPercentage = (completed: number, total: number) => {
    return Math.round((completed / total) * 100)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">FlashConCards - Demo</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700">Visitante</span>
              </div>
              <Link href="/" className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-8 text-white mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">
              FlashConCards - Demonstração
            </h1>
            <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
              VERSÃO DEMO
            </div>
          </div>
          <p className="text-primary-100 mb-6">
            Esta é uma demonstração completa do nosso sistema de flashcards. 
            Experimente todas as funcionalidades e veja como estudar de forma eficiente.
          </p>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Funcionalidades Disponíveis</span>
              <span className="text-sm font-medium">100%</span>
            </div>
            <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: '100%' }}
              ></div>
            </div>
            <div className="mt-3 text-sm text-primary-100">
              ✅ Flashcards interativos • ✅ Progresso em tempo real • ✅ Estatísticas • ✅ Aprofundamento • ✅ Perfil completo
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Cards</p>
                <p className="text-2xl font-bold text-gray-900">{demoStats.totalCards}+</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cards Estudados</p>
                <p className="text-2xl font-bold text-gray-900">{demoStats.cardsStudied}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sessões Hoje</p>
                <p className="text-2xl font-bold text-gray-900">{demoStats.sessionsToday}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tempo Estudado</p>
                <p className="text-2xl font-bold text-gray-900">{demoStats.timeStudied}m</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Subjects Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Matérias Disponíveis</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {subjects.map((subject, index) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer flex flex-col justify-between h-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${subject.color}`}>
                    <subject.icon className="h-6 w-6 text-white" />
                  </div>
                  <a href={`/study/${subject.id}`} className="text-primary-600 hover:text-primary-700">
                    <Play className="h-5 w-5" />
                  </a>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {subject.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {subject.description}
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progresso</span>
                    <span className="font-medium">
                      {subject.completedCards}/{subject.totalCards}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${subject.color.replace('bg-', 'bg-')}`}
                      style={{ width: `${getProgressPercentage(subject.completedCards, subject.totalCards)}%`, minWidth: 0, maxWidth: '100%' }}
                    ></div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900">
                      {getProgressPercentage(subject.completedCards, subject.totalCards)}%
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                      Disponível para teste
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Features Demo */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Funcionalidades Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900">Flashcards Interativos</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Teste os flashcards com sistema de memorização espaçada. 
                Acertou? Passa para o próximo. Errou? Revisa até aprender.
              </p>
              <a href="/study/portugues" className="text-blue-600 hover:text-blue-700 font-medium">
                Testar agora →
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900">Aprofundamento</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Conteúdo adicional para cada subtópico. 
                Explicações detalhadas e exemplos práticos.
              </p>
              <span className="text-green-600 font-medium">
                Disponível na versão completa
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900">Estatísticas Detalhadas</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Acompanhe seu progresso com gráficos e relatórios. 
                Veja onde precisa melhorar.
              </p>
              <span className="text-purple-600 font-medium">
                Disponível na versão completa
              </span>
            </motion.div>
          </div>
        </div>

        {/* Upgrade Banner */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-8 text-white mb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <Star className="h-8 w-8 text-yellow-400 mr-3" />
                <h3 className="text-2xl font-bold">Desbloqueie Todo o Conteúdo!</h3>
              </div>
              <p className="text-primary-100 mb-6 text-lg">
                Acesse todos os 500+ FlashConCards, estatísticas completas, 
                aprofundamento de conteúdo e muito mais por apenas:
              </p>
              <div className="mb-6">
                <div className="text-4xl font-bold mb-2">R$ 99,90</div>
                <div className="text-primary-100">Pagamento único • Acesso vitalício</div>
              </div>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  <span>500+ Flashcards</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  <span>6 Matérias completas</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  <span>Estatísticas avançadas</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  <span>Conteúdo de aprofundamento</span>
                </div>
              </div>
              <div className="flex gap-4">
                <a 
                  href="/payment" 
                  className="btn-primary bg-white text-primary-600 hover:bg-gray-100 inline-flex items-center px-6 py-3 rounded-lg font-semibold text-lg"
                >
                  Fazer Upgrade por R$ 99,90
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
                <Link 
                  href="/login" 
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600 inline-flex items-center px-6 py-3 rounded-lg font-semibold text-lg transition-colors"
                >
                  Já tenho conta
                </Link>
              </div>
            </div>
            <div className="hidden lg:block ml-8">
              <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/study/portugues" className="flex items-center justify-center p-4 border-2 border-primary-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200">
              <Play className="h-5 w-5 text-primary-600 mr-2" />
              <span className="font-medium text-primary-600">Testar Flashcards</span>
            </a>
            <a href="/payment" className="flex items-center justify-center p-4 border-2 border-green-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors duration-200">
              <Star className="h-5 w-5 text-green-600 mr-2" />
              <span className="font-medium text-green-600">Fazer Upgrade</span>
            </a>
            <Link href="/" className="flex items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors duration-200">
              <X className="h-5 w-5 text-gray-600 mr-2" />
              <span className="font-medium text-gray-600">Sair do Demo</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 