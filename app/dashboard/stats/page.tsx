'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { 
  getUserProgress,
  getStudySessions,
  getCoursesWithAccess
} from '@/lib/firebase';
import { 
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  FireIcon,
  TrophyIcon,
  CalendarIcon,
  ArrowLeftIcon,
  AcademicCapIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface StudySession {
  id: string;
  courseId: string;
  subjectId: string;
  topicId: string;
  subTopicId: string;
  flashcardsCount: number;
  correctCards: number;
  wrongCards: number;
  studyTime: number;
  startTime: Date;
  endTime: Date;
}

interface UserProgress {
  lastStudiedAt?: Date;
  studyTime: number;
  cardsStudied: number;
  cardsCorrect: number;
  cardsWrong: number;
  accuracy: number;
  sessionsCount: number;
}

export default function StatsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    loadStats();
  }, [user, selectedTimeframe]);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      const [progress, sessions, userCourses] = await Promise.all([
        getUserProgress(user?.uid || ''),
        getStudySessions(user?.uid || ''),
        getCoursesWithAccess(user?.uid || '')
      ]);

      setUserProgress(progress);
      setStudySessions(sessions || []);
      setCourses(userCourses || []);

      setLoading(false);
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Erro ao carregar estatísticas');
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getFilteredSessions = () => {
    if (!studySessions.length) return [];
    
    const now = new Date();
    const filtered = studySessions.filter(session => {
      const sessionDate = session.startTime instanceof Date ? session.startTime : new Date(session.startTime);
      
      switch (selectedTimeframe) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return sessionDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return sessionDate >= monthAgo;
        default:
          return true;
      }
    });
    
    return filtered.sort((a, b) => {
      const dateA = a.startTime instanceof Date ? a.startTime : new Date(a.startTime);
      const dateB = b.startTime instanceof Date ? b.startTime : new Date(b.startTime);
      return dateB.getTime() - dateA.getTime();
    });
  };

  const getStatsForTimeframe = () => {
    const filteredSessions = getFilteredSessions();
    
    const totalCards = filteredSessions.reduce((sum, session) => sum + session.flashcardsCount, 0);
    const totalCorrect = filteredSessions.reduce((sum, session) => sum + session.correctCards, 0);
    const totalWrong = filteredSessions.reduce((sum, session) => sum + session.wrongCards, 0);
    const totalTime = filteredSessions.reduce((sum, session) => sum + session.studyTime, 0);
    const accuracy = totalCards > 0 ? (totalCorrect / totalCards) * 100 : 0;
    
    return {
      totalCards,
      totalCorrect,
      totalWrong,
      totalTime,
      accuracy,
      sessionsCount: filteredSessions.length
    };
  };

  const getRecentActivity = () => {
    return getFilteredSessions().slice(0, 5);
  };

  const getProgressTimeline = () => {
    const sessions = getFilteredSessions();
    const timeline = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const daySessions = sessions.filter(session => {
        const sessionDate = session.startTime instanceof Date ? session.startTime : new Date(session.startTime);
        return sessionDate.toDateString() === date.toDateString();
      });
      
      const dayStats = {
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        cards: daySessions.reduce((sum, session) => sum + session.flashcardsCount, 0),
        correct: daySessions.reduce((sum, session) => sum + session.correctCards, 0),
        wrong: daySessions.reduce((sum, session) => sum + session.wrongCards, 0),
        time: daySessions.reduce((sum, session) => sum + session.studyTime, 0)
      };
      
      timeline.unshift(dayStats);
    }
    
    return timeline;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  const timeframeStats = getStatsForTimeframe();
  const recentActivity = getRecentActivity();
  const progressTimeline = getProgressTimeline();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors touch-button"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Voltar ao Dashboard</span>
            </button>
            
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
              <ChartBarIcon className="w-6 h-6 mr-2 text-indigo-500" />
              Estatísticas de Estudo
            </h1>
            
            <div className="flex items-center space-x-2">
              <TrophyIcon className="w-6 h-6 text-yellow-500" />
              <span className="text-sm text-gray-600 hidden sm:inline">Progresso</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Timeframe Selector */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Período de Análise</h2>
            <div className="flex space-x-2">
              {[
                { key: 'week', label: '7 dias' },
                { key: 'month', label: '30 dias' },
                { key: 'all', label: 'Total' }
              ].map((timeframe) => (
                <button
                  key={timeframe.key}
                  onClick={() => setSelectedTimeframe(timeframe.key as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedTimeframe === timeframe.key
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {timeframe.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <motion.div 
              className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <CheckCircleIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{timeframeStats.totalCorrect}</div>
              <div className="text-sm text-gray-600">Acertos</div>
            </motion.div>

            <motion.div 
              className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <XCircleIcon className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">{timeframeStats.totalWrong}</div>
              <div className="text-sm text-gray-600">Erros</div>
            </motion.div>

            <motion.div 
              className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <ClockIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{formatTime(timeframeStats.totalTime)}</div>
              <div className="text-sm text-gray-600">Tempo Total</div>
            </motion.div>

            <motion.div 
              className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <TrophyIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{timeframeStats.accuracy.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Assertividade</div>
            </motion.div>
          </div>
        </div>

        {/* Progress Timeline */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <CalendarIcon className="w-6 h-6 mr-2 text-indigo-500" />
            Linha do Tempo de Progresso (7 dias)
          </h2>
          
          <div className="space-y-4">
            {progressTimeline.map((day, index) => (
              <motion.div 
                key={day.date}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-medium text-gray-900">{day.date}</div>
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <span className="text-green-600">✓ {day.correct}</span>
                    <span className="text-red-600">✗ {day.wrong}</span>
                    <span className="text-blue-600">⏱ {formatTime(day.time)}</span>
                  </div>
                </div>
                
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${day.cards > 0 ? (day.correct / day.cards) * 100 : 0}%` 
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <FireIcon className="w-6 h-6 mr-2 text-orange-500" />
            Atividades Recentes
          </h2>
          
          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma atividade recente encontrada.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((session, index) => (
                <motion.div 
                  key={session.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <AcademicCapIcon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        Sessão de Estudo
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDate(session.startTime instanceof Date ? session.startTime : new Date(session.startTime))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-green-600">{session.correctCards}</div>
                      <div className="text-gray-500">Acertos</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-red-600">{session.wrongCards}</div>
                      <div className="text-gray-500">Erros</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-blue-600">{formatTime(session.studyTime)}</div>
                      <div className="text-gray-500">Tempo</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Overall Progress */}
        {userProgress && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
              <TrophyIcon className="w-6 h-6 mr-2 text-yellow-500" />
              Progresso Geral
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tempo Total de Estudo</span>
                  <span className="font-bold text-gray-900">{formatTime(userProgress.studyTime)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Cards Estudados</span>
                  <span className="font-bold text-gray-900">{userProgress.cardsStudied}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Sessões Realizadas</span>
                  <span className="font-bold text-gray-900">{userProgress.sessionsCount || studySessions.length}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Assertividade Geral</span>
                  <span className="font-bold text-green-600">{userProgress.accuracy.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Último Estudo</span>
                  <span className="font-bold text-gray-900">
                    {userProgress.lastStudiedAt 
                      ? formatDate(userProgress.lastStudiedAt instanceof Date ? userProgress.lastStudiedAt : new Date(userProgress.lastStudiedAt))
                      : 'Nunca'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Cursos Ativos</span>
                  <span className="font-bold text-gray-900">{courses.length}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 