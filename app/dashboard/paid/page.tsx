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
  AlertCircle
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
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const checkAuthorization = async () => {
      try {
        // Verificar se o usuário está logado
        const loggedInUser = getLoggedInUser()
        if (!loggedInUser) {
          window.location.href = '/login'
          return
        }

        // Verificar se o usuário pagou
        const response = await fetch('/api/payment/status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: loggedInUser.email })
        })
        
        const data = await response.json()
        
        if (data.success && data.isPaid) {
          setIsAuthorized(true)
          
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
          // Usuário não pagou, redirecionar
          window.location.href = '/payment'
        }
      } catch (error) {
        console.error('Erro ao verificar autorização:', error)
        window.location.href = '/login'
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthorization()
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autorização...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center shadow-lg">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Acesso Restrito
          </h1>
          <p className="text-gray-600 mb-6">
            Você precisa fazer o pagamento para acessar esta área.
          </p>
          <a 
            href="/payment" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Fazer Pagamento
          </a>
        </div>
      </div>
    )
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
                <Trophy className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Progresso Geral</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isClient ? `${getOverallProgress().percentage}%` : '0%'}
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
                <MessageSquare className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Dias Estudando</p>
                <p className="text-2xl font-bold text-gray-900">7</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {subjects.map((subject, index) => (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center mb-4">
                <div className={`p-2 rounded-lg ${subject.color}`}>
                  <subject.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">{subject.name}</h3>
                  <p className="text-sm text-gray-600">{subject.description}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progresso</span>
                  <span>{subject.completedCards}/{subject.totalCards}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage(subject.completedCards, subject.totalCards)}%` }}
                  ></div>
                </div>
              </div>
              
              <a 
                href={`/study/${subject.id}`}
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                Começar a estudar
                <ArrowRight className="h-4 w-4 ml-1" />
              </a>
            </motion.div>
          ))}
        </div>

        {/* Exam Result Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Registrar Resultado do Concurso</h2>
            <button
              onClick={() => setShowExamForm(!showExamForm)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {showExamForm ? 'Fechar' : 'Registrar'}
            </button>
          </div>
          
                     {showExamForm && (
             <ExamResultForm onSubmit={handleExamResult} onClose={() => setShowExamForm(false)} />
           )}
        </motion.div>
      </div>
    </div>
  )
} 