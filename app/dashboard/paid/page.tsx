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
  MessageSquare
} from 'lucide-react'
import ExamResultForm from '../../components/ExamResultForm'
import { updateUserApprovalStatus, addUserFeedback } from '../../lib/data'
import { getLoggedInUser, logoutUser } from '../../lib/auth'
import { getOverallProgress, getSubjectProgress } from '../../lib/progress'

interface Subject {
  id: string
  name: string
  description: string
  totalCards: number
  completedCards: number
  icon: any
  color: string
}

export default function PaidDashboardPage() {
  const [user, setUser] = useState({
    name: 'Usuário Pago',
    email: 'usuario@flashconcards.com',
    progress: 0
  })
  const [showExamForm, setShowExamForm] = useState(false)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const loggedInUser = getLoggedInUser()
    if (loggedInUser) {
      // Carregar progresso real
      const overallProgress = getOverallProgress()
      
      setUser({
        name: loggedInUser.name,
        email: loggedInUser.email,
        progress: overallProgress.percentage
      })

      // Carregar progresso das matérias
      const subjectsData: Subject[] = [
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

      // Atualizar progresso real de cada matéria
      subjectsData.forEach(subject => {
        const subjectProgress = getSubjectProgress(subject.id)
        if (subjectProgress) {
          let totalCompleted = 0
          Object.values(subjectProgress).forEach(topic => {
            totalCompleted += topic.completedCards.length
          })
          subject.completedCards = totalCompleted
        }
      })

      setSubjects(subjectsData)
    } else {
      // Se não está logado, redirecionar para dashboard demo
      window.location.href = '/dashboard'
    }
  }, [isClient])

  const getProgressPercentage = (completed: number, total: number) => {
    return Math.round((completed / total) * 100)
  }

  const handleExamResult = (passed: boolean, examDate: Date, rating?: number, feedback?: string) => {
    // Simular um ID de usuário para usuário pago
    const userId = 'paid-user'
    
    // Atualizar status de aprovação
    updateUserApprovalStatus(userId, passed, examDate)
    
    // Adicionar feedback se fornecido
    if (rating && feedback) {
      addUserFeedback(userId, rating, feedback)
    }
    
    alert(passed ? 'Parabéns pela aprovação! Seu resultado foi registrado.' : 'Continue estudando! Seu resultado foi registrado para acompanhamento.')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">FlashConCards - Portal do Aluno</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700">{user.name}</span>
              </div>
              <button 
                onClick={() => {
                  logoutUser()
                  window.location.href = '/'
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <LogOut className="h-5 w-5" />
              </button>
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
          <h1 className="text-3xl font-bold mb-2">
            Bem-vindo, {user.name}!
          </h1>
          <p className="text-primary-100 mb-6">
            Você tem acesso completo a todos os recursos do FlashConCards.
          </p>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Versão Completa</span>
              <span className="text-sm font-medium">Ativo</span>
            </div>
            <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: isClient ? `${user.progress}%` : '0%' }}
              ></div>
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
                <p className="text-2xl font-bold text-gray-900">500+</p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {isClient ? getOverallProgress().totalCompleted : 0}
                </p>
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
                <p className="text-sm font-medium text-gray-600">Progresso Geral</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isClient ? user.progress : 0}%
                </p>
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
                <p className="text-sm font-medium text-gray-600">Matérias Ativas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isClient ? subjects.filter(s => s.completedCards > 0).length : 0}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Subjects Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Matérias</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject, index) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
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
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${subject.color.replace('bg-', 'bg-')}`}
                      style={{ width: `${getProgressPercentage(subject.completedCards, subject.totalCards)}%` }}
                    ></div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900">
                      {getProgressPercentage(subject.completedCards, subject.totalCards)}%
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/study/portugues" className="flex items-center justify-center p-4 border-2 border-primary-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200">
              <Play className="h-5 w-5 text-primary-600 mr-2" />
              <span className="font-medium text-primary-600">Continuar Estudando</span>
            </a>
            <button 
              onClick={() => setShowExamForm(true)}
              className="flex items-center justify-center p-4 border-2 border-green-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors duration-200"
            >
              <Trophy className="h-5 w-5 text-green-600 mr-2" />
              <span className="font-medium text-green-600">Registrar Resultado</span>
            </button>
            <button className="flex items-center justify-center p-4 border-2 border-blue-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200">
              <MessageSquare className="h-5 w-5 text-blue-600 mr-2" />
              <span className="font-medium text-blue-600">Enviar Feedback</span>
            </button>
          </div>
        </div>
      </div>

      {/* Exam Result Form Modal */}
      {showExamForm && (
        <ExamResultForm
          onSubmit={handleExamResult}
          onClose={() => setShowExamForm(false)}
        />
      )}
    </div>
  )
} 