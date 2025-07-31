'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  getUserStudySessions, 
  getFlashcards, 
  getSubTopics, 
  getTopics, 
  getSubjects,
  getUserProgress 
} from '@/lib/firebase';
import { 
  BookOpenIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  UserCircleIcon,
  ArrowLeftIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface StudySession {
  id: string;
  date: string;
  cardsStudied: number;
  correctCards: number;
  wrongCards: number;
  studyTime: number;
  subTopicId?: string;
  subjectId?: string;
}

interface SubjectProgress {
  name: string;
  totalCards: number;
  studiedCards: number;
  correctRate: number;
  subjectId: string;
}

export default function StatsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalCards: 0,
    studiedCards: 0,
    correctCards: 0,
    wrongCards: 0,
    totalStudyTime: 0,
    averageAccuracy: 0
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    loadStats();
  }, [user]);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      // Get real study sessions from Firebase
      const realSessions = await getUserStudySessions(user.uid);
      
      // Transform sessions for charts
      const sessionsForCharts: StudySession[] = realSessions.map((session: any) => ({
        id: session.id,
        date: session.createdAt?.toDate?.()?.toLocaleDateString() || new Date().toLocaleDateString(),
        cardsStudied: session.flashcardsCount || 0,
        correctCards: session.correctCards || 0,
        wrongCards: session.wrongCards || 0,
        studyTime: session.studyTime || 0,
        subTopicId: session.subTopicId,
        subjectId: session.subjectId
      }));

      // Calculate total stats from real sessions
      const totalCorrect = sessionsForCharts.reduce((sum, session) => sum + session.correctCards, 0);
      const totalWrong = sessionsForCharts.reduce((sum, session) => sum + session.wrongCards, 0);
      const totalStudyTime = sessionsForCharts.reduce((sum, session) => sum + session.studyTime, 0);
      const totalStudied = sessionsForCharts.reduce((sum, session) => sum + session.cardsStudied, 0);
      const averageAccuracy = totalCorrect + totalWrong > 0 ? (totalCorrect / (totalCorrect + totalWrong)) * 100 : 0;

      // Get all subjects and their flashcards for accurate progress calculation
      const subjects = await getSubjects();
      const subjectProgressData: SubjectProgress[] = [];

      for (const subject of subjects) {
        const topics = await getTopics(subject.id);
        let subjectTotalCards = 0;
        let subjectStudiedCards = 0;
        let subjectCorrectCards = 0;

        for (const topic of topics) {
          const subTopics = await getSubTopics(topic.id);
          
          for (const subTopic of subTopics) {
            const flashcards = await getFlashcards(subTopic.id);
            subjectTotalCards += flashcards.length;

            // Count studied cards for this sub-topic from sessions
            const subTopicSessions = sessionsForCharts.filter(session => 
              session.subTopicId === subTopic.id
            );
            
            const subTopicStudied = subTopicSessions.reduce((sum, session) => 
              sum + session.cardsStudied, 0
            );
            const subTopicCorrect = subTopicSessions.reduce((sum, session) => 
              sum + session.correctCards, 0
            );
            
            subjectStudiedCards += subTopicStudied;
            subjectCorrectCards += subTopicCorrect;
          }
        }

        const correctRate = subjectStudiedCards > 0 ? (subjectCorrectCards / subjectStudiedCards) * 100 : 0;
        
        subjectProgressData.push({
          name: subject.name,
          totalCards: subjectTotalCards,
          studiedCards: subjectStudiedCards,
          correctRate,
          subjectId: subject.id
        });
      }

      setStudySessions(sessionsForCharts);
      setSubjectProgress(subjectProgressData);

      // Calculate total cards across all subjects
      const totalCards = subjectProgressData.reduce((sum, subject) => sum + subject.totalCards, 0);

      setTotalStats({
        totalCards,
        studiedCards: totalStudied,
        correctCards: totalCorrect,
        wrongCards: totalWrong,
        totalStudyTime,
        averageAccuracy
      });

      setLoading(false);
    } catch (error) {
      console.error('Error loading stats:', error);
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Voltar ao Dashboard
            </button>
            
            <h1 className="text-xl font-semibold text-gray-900">Estatísticas de Estudo</h1>
            
            <div className="flex items-center space-x-2">
              <UserCircleIcon className="w-6 h-6 text-gray-400" />
              <span className="text-sm text-gray-600">{user?.displayName || user?.email}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpenIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Cards</p>
                <p className="text-2xl font-bold text-gray-900">{totalStats.totalCards}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cards Estudados</p>
                <p className="text-2xl font-bold text-gray-900">{totalStats.studiedCards}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Taxa de Acerto</p>
                <p className="text-2xl font-bold text-gray-900">{totalStats.averageAccuracy.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tempo Total</p>
                <p className="text-2xl font-bold text-gray-900">{formatTime(totalStats.totalStudyTime)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Progress Over Time */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Progresso ao Longo do Tempo</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={studySessions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="cardsStudied" stroke="#8884d8" name="Cards Estudados" />
                <Line type="monotone" dataKey="correctCards" stroke="#82ca9d" name="Acertos" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Subject Progress */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Progresso por Matéria</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="studiedCards" fill="#8884d8" name="Cards Estudados" />
                <Bar dataKey="totalCards" fill="#82ca9d" name="Total de Cards" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Accuracy Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição de Acertos/Erros</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Acertos', value: totalStats.correctCards },
                    { name: 'Erros', value: totalStats.wrongCards }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Study Time Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tempo de Estudo por Sessão</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={studySessions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="studyTime" stroke="#8884d8" fill="#8884d8" name="Tempo (min)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cards Estudados
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acertos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Erros
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taxa de Acerto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tempo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {studySessions.map((session) => (
                  <tr key={session.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(session.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {session.cardsStudied}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      {session.correctCards}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                      {session.wrongCards}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {session.cardsStudied > 0 ? ((session.correctCards / session.cardsStudied) * 100).toFixed(1) : 0}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(session.studyTime)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 