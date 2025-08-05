'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { 
  getCourses, 
  getSubjects, 
  getTopics, 
  getFlashcards,
  getCoursesWithAccess,
  getDeepenings
} from '@/lib/firebase';
import { Course, Subject, Topic, Flashcard } from '@/types';
import { 
  BookOpenIcon, 
  PlayIcon,
  UserCircleIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  AcademicCapIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  FireIcon,
  TrophyIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import DeepeningModal from '@/components/flashcards/DeepeningModal';

interface StudyProgress {
  totalCards: number;
  studiedCards: number;
  correctCards: number;
  wrongCards: number;
  accuracy: number;
  lastStudied?: Date;
}

interface TopicCardProps {
  topic: Topic;
  onStartStudy: (topic: Topic) => void;
  getProgressForTopic: (topicId: string) => Promise<StudyProgress>;
  formatLastStudied: (date?: Date) => string;
}

function TopicCard({ topic, onStartStudy, getProgressForTopic, formatLastStudied }: TopicCardProps) {
  const [progress, setProgress] = useState<StudyProgress>({
    totalCards: 0,
    studiedCards: 0,
    correctCards: 0,
    wrongCards: 0,
    accuracy: 0,
    lastStudied: undefined
  });
  const [deepening, setDeepening] = useState<any>(null);
  const [showDeepeningModal, setShowDeepeningModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [realProgress, deepenings] = await Promise.all([
          getProgressForTopic(topic.id),
          getDeepenings(topic.id)
        ]);
        setProgress(realProgress);
        setDeepening(deepenings && deepenings.length > 0 ? deepenings[0] : null);
      } catch (error) {
        console.error('Error loading topic data:', error);
        setProgress({
          totalCards: 0,
          studiedCards: 0,
          correctCards: 0,
          wrongCards: 0,
          accuracy: 0,
          lastStudied: undefined
        });
        setDeepening(null);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [topic.id, getProgressForTopic]);

  const progressPercentage = progress.totalCards > 0 ? (progress.studiedCards / progress.totalCards) * 100 : 0;

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
        <div className="h-4 bg-gray-200 rounded mb-3"></div>
        <div className="h-3 bg-gray-200 rounded mb-4"></div>
        <div className="h-2 bg-gray-200 rounded mb-2"></div>
        <div className="h-2 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-blue-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
            {topic.name}
          </h3>
          {topic.description && (
            <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">
              {topic.description}
            </p>
          )}
        </div>
      </div>
      
      {/* Progress Stats */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Progresso</span>
          <span className="text-sm font-bold text-gray-900">
            {progress.studiedCards}/{progress.totalCards} cards
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {progress.totalCards > 0 && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
              <span className="text-gray-700">{progress.correctCards} corretas</span>
            </div>
            <div className="flex items-center space-x-2">
              <XCircleIcon className="w-4 h-4 text-red-500" />
              <span className="text-gray-700">{progress.wrongCards} incorretas</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => onStartStudy(topic)}
          disabled={progress.totalCards === 0}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <PlayIcon className="w-4 h-4" />
          <span>{progress.totalCards === 0 ? 'Sem cards' : 'Estudar'}</span>
        </button>

        {deepening && (
          <button
            onClick={() => setShowDeepeningModal(true)}
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <BookOpenIcon className="w-4 h-4" />
            <span>Aprofundar</span>
          </button>
        )}
      </div>

      {/* Last Studied */}
      {progress.lastStudied && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <ClockIcon className="w-3 h-3" />
            <span>Último estudo: {formatLastStudied(progress.lastStudied)}</span>
          </div>
        </div>
      )}

      {/* Deepening Modal */}
      {deepening && (
        <DeepeningModal
          deepening={deepening}
          isOpen={showDeepeningModal}
          onClose={() => setShowDeepeningModal(false)}
        />
      )}
    </div>
  );
}

export default function StudyAreaPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'studied' | 'unstudied'>('all');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadCourses();
  }, [user, router]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const accessibleCourses = await getCoursesWithAccess(user!.uid);
      console.log('Accessible courses:', accessibleCourses);
      
      if (accessibleCourses.length > 0) {
        const firstCourse = accessibleCourses[0];
        console.log('Auto-selecting course:', firstCourse.name);
        setSelectedCourse(firstCourse);
        setCourses(accessibleCourses);
        await loadSubjects(firstCourse.id);
      } else {
        setCourses([]);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      toast.error('Erro ao carregar cursos');
      setLoading(false);
    }
  };

  const loadSubjects = async (courseId: string) => {
    try {
      const subjectsData = await getSubjects(courseId);
      console.log('Subjects loaded:', subjectsData.length);
      setSubjects(subjectsData);
      
      if (subjectsData.length > 0) {
        await loadTopics(subjectsData[0].id);
      } else {
        setTopics([]);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
      toast.error('Erro ao carregar matérias');
      setLoading(false);
    }
  };

  const loadTopics = async (subjectId: string) => {
    try {
      const topicsData = await getTopics(subjectId);
      console.log('Topics loaded:', topicsData.length);
      setTopics(topicsData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading topics:', error);
      toast.error('Erro ao carregar tópicos');
      setLoading(false);
    }
  };

  const handleCourseSelect = async (course: Course) => {
    setSelectedCourse(course);
    setSelectedSubject(null);
    await loadSubjects(course.id);
  };

  const handleSubjectSelect = async (subject: Subject) => {
    setSelectedSubject(subject);
    await loadTopics(subject.id);
  };

  const handleStartStudy = (topic: Topic) => {
    router.push(`/study?topicId=${topic.id}&subjectId=${selectedSubject?.id}&courseId=${selectedCourse?.id}`);
  };

  const getProgressForTopic = async (topicId: string): Promise<StudyProgress> => {
    try {
      // Buscar flashcards reais do tópico
      const flashcards = await getFlashcards(topicId);
      const totalCards = flashcards.length;
      
      // Por enquanto, retornar dados reais mas sem progresso (usuário ainda não estudou)
      return {
        totalCards,
        studiedCards: 0,
        correctCards: 0,
        wrongCards: 0,
        accuracy: 0,
        lastStudied: undefined
      };
    } catch (error) {
      console.error('Error getting progress:', error);
      return {
        totalCards: 0,
        studiedCards: 0,
        correctCards: 0,
        wrongCards: 0,
        accuracy: 0,
        lastStudied: undefined
      };
    }
  };

  const formatLastStudied = (date?: Date) => {
    if (!date) return 'Nunca';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Hoje';
    if (days === 1) return 'Ontem';
    if (days < 7) return `${days} dias atrás`;
    if (days < 30) return `${Math.floor(days / 7)} semanas atrás`;
    return `${Math.floor(days / 30)} meses atrás`;
  };

  const getSubjectIcon = (subjectName: string) => {
    const icons = {
      'Português': BookOpenIcon,
      'Matemática': ChartBarIcon,
      'Direito': AcademicCapIcon,
      'Conhecimentos Gerais': StarIcon,
      'default': BookOpenIcon
    };
    return icons[subjectName as keyof typeof icons] || icons.default;
  };

  const getSubjectColor = (subjectName: string) => {
    const colors = {
      'Português': 'from-blue-500 to-blue-600',
      'Matemática': 'from-green-500 to-green-600',
      'Direito': 'from-purple-500 to-purple-600',
      'Conhecimentos Gerais': 'from-orange-500 to-orange-600',
      'default': 'from-gray-500 to-gray-600'
    };
    return colors[subjectName as keyof typeof colors] || colors.default;
  };

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'studied') return matchesSearch && true; // Implement real logic
    if (filterType === 'unstudied') return matchesSearch && true; // Implement real logic
    
    return matchesSearch;
  });

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Voltar</span>
              </button>
              <h1 className="text-xl font-bold text-gray-900">Área de Estudos</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <UserCircleIcon className="w-6 h-6 text-gray-400" />
                <span className="text-sm text-gray-700 hidden sm:inline">
                  {user.displayName || user.email}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando área de estudos...</p>
            </div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Nenhum curso disponível</h2>
            <p className="text-gray-600">Entre em contato com o administrador para obter acesso aos cursos.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Course Selection */}
            {courses.length > 1 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Selecione o Curso</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => handleCourseSelect(course)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                        selectedCourse?.id === course.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <h3 className="font-semibold text-gray-900 mb-1">{course.name}</h3>
                      <p className="text-sm text-gray-600">{course.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Subject Selection */}
            {subjects.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Matérias</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {subjects.map((subject) => {
                    const Icon = getSubjectIcon(subject.name);
                    const colorClass = getSubjectColor(subject.name);
                    
                    return (
                      <button
                        key={subject.id}
                        onClick={() => handleSubjectSelect(subject)}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 text-left group ${
                          selectedSubject?.id === subject.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${colorClass} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{subject.name}</h3>
                        {subject.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">{subject.description}</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Topics Section */}
            {topics.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">
                      {selectedSubject?.name || 'Tópicos'}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {topics.length} tópico{topics.length !== 1 ? 's' : ''} disponível{topics.length !== 1 ? 'is' : ''}
                    </p>
                  </div>

                  {/* Search and Filter */}
                  <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
                    <div className="relative">
                      <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar tópicos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as any)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todos</option>
                      <option value="studied">Estudados</option>
                      <option value="unstudied">Não estudados</option>
                    </select>
                  </div>
                </div>

                {filteredTopics.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {searchTerm ? 'Nenhum tópico encontrado para sua busca.' : 'Nenhum tópico disponível nesta matéria.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTopics.map((topic) => (
                      <TopicCard
                        key={topic.id}
                        topic={topic}
                        onStartStudy={handleStartStudy}
                        getProgressForTopic={getProgressForTopic}
                        formatLastStudied={formatLastStudied}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* No Content Message */}
            {subjects.length === 0 && (
              <div className="text-center py-12">
                <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma matéria disponível</h2>
                <p className="text-gray-600">O administrador ainda não adicionou matérias para este curso.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 