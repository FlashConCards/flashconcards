'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, CheckCircle, Trophy, MessageSquare, TrendingUp, User, Calendar, Target, BarChart3, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface UserStats {
  totalCards: number
  cardsStudied: number
  generalProgress: number
  daysStudying: number
  lastLogin: string
  totalSubjects: number
}

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
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<UserStats>({
    totalCards: 0,
    cardsStudied: 0,
    generalProgress: 0,
    daysStudying: 0,
    lastLogin: '',
    totalSubjects: 0
  })
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar se usuário está logado
    const userData = localStorage.getItem('flashconcards_user')
    if (!userData) {
      window.location.href = '/login'
      return
    }

    const userInfo = JSON.parse(userData)
    setUser(userInfo)

    // Buscar dados reais do Firebase
    fetchUserStats(userInfo.email)
    
    // Carregar matérias disponíveis
    loadSubjects(userInfo.email)
  }, [])

  const fetchUserStats = async (email: string) => {
    try {
      // Buscar dados do usuário no Firebase
      const response = await fetch('/api/user/stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        // Se não conseguir buscar dados reais, usar dados padrão
        setStats({
          totalCards: 150,
          cardsStudied: 0,
          generalProgress: 0,
          daysStudying: 1,
          lastLogin: new Date().toISOString(),
          totalSubjects: 10
        })
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      // Dados padrão em caso de erro
      setStats({
        totalCards: 150,
        cardsStudied: 0,
        generalProgress: 0,
        daysStudying: 1,
        lastLogin: new Date().toISOString(),
        totalSubjects: 10
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadSubjects = async (email: string) => {
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

    // Buscar progresso real de cada matéria
    const updatedSubjects = await Promise.all(
      subjectsData.map(async (subject) => {
        try {
          const response = await fetch('/api/user/subject-progress', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, subjectId: subject.id })
          })

          if (response.ok) {
            const progressData = await response.json()
            return {
              ...subject,
              completedCards: progressData.completedCards || 0,
              totalCards: progressData.totalCards || subject.totalCards
            }
          }
        } catch (error) {
          console.error(`Erro ao buscar progresso de ${subject.name}:`, error)
        }
        
        return subject
      })
    )

    setSubjects(updatedSubjects)
  }

  const getProgressPercentage = (completed: number, total: number) => {
    return Math.round((completed / total) * 100)
  }

  const handleLogout = () => {
    localStorage.removeItem('flashconcards_user')
    window.location.href = '/'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center shadow-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">FlashConCards</h1>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Sair
            </button>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Bem-vindo, {user?.name || 'Usuário'}!
                </h2>
                <p className="text-blue-100">
                  Você tem acesso completo a todos os recursos do FlashConCards.
                </p>
              </div>
              <div className="text-right">
                <div className="bg-blue-400 bg-opacity-30 px-3 py-1 rounded-full text-sm mb-2">
                  Ativo
                </div>
                <div className="text-xs text-blue-200">
                  Versão Completa
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">Total de Cards</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalCards}+</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">Cards Estudados</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.cardsStudied}</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Trophy className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">Progresso Geral</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.generalProgress}%</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">Dias Estudando</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.daysStudying}</p>
          </div>
        </motion.div>

        {/* Subjects Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-2xl mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Matérias Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject, index) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
                className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow"
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
                
                <Link 
                  href={`/study/${subject.id}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                >
                  Começar a estudar
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl p-6 shadow-2xl"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Atividade Recente</h2>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Login realizado</p>
                <p className="text-sm text-gray-600">
                  {new Date(stats.lastLogin).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Progresso iniciado</p>
                <p className="text-sm text-gray-600">
                  {stats.cardsStudied} cards estudados
                </p>
              </div>
            </div>
          </div>
          
          {/* Feedback Link */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Compartilhe sua experiência</h3>
            <p className="text-sm text-gray-600 mb-3">
              Ajude outros alunos compartilhando como o FlashConCards te ajudou nos estudos.
            </p>
            <Link 
              href="/feedback"
              className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Deixar Feedback
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 