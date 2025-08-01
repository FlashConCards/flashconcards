'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { 
  getCourses, 
  getSubjects, 
  getTopics, 
  getSubTopics, 
  getFlashcards,
  getCoursesWithAccess,
  getUserProgressBySubTopic,
  getDeepeningsBySubTopic
} from '@/lib/firebase';
import { Course, Subject, Topic, SubTopic, Flashcard } from '@/types';
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
  TrophyIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Componente separado para evitar erro de hooks
interface SubTopicCardProps {
  subTopic: SubTopic;
  onStartStudy: (subTopic: SubTopic) => void;
  getProgressForSubTopic: (subTopicId: string) => Promise<StudyProgress>;
  formatLastStudied: (date?: Date) => string;
}

function SubTopicCard({ subTopic, onStartStudy, getProgressForSubTopic, formatLastStudied }: SubTopicCardProps) {
  const [progress, setProgress] = useState<StudyProgress>({
    totalCards: 0,
    studiedCards: 0,
    correctCards: 0,
    wrongCards: 0,
    accuracy: 0,
    lastStudied: undefined
  });
  const [deepening, setDeepening] = useState<any>(null);
  const [showDeepening, setShowDeepening] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [realProgress, deepenings] = await Promise.all([
        getProgressForSubTopic(subTopic.id),
        getDeepeningsBySubTopic(subTopic.id)
      ]);
      setProgress(realProgress);
      setDeepening(deepenings.length > 0 ? deepenings[0] : null);
    };
    loadData();
  }, [subTopic.id, getProgressForSubTopic]);

  const progressPercentage = progress.totalCards > 0 ? (progress.studiedCards / progress.totalCards) * 100 : 0;

  return (
    <div className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all transform hover:scale-105 bg-white">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h5 className="font-bold text-gray-900 text-lg mb-3">{subTopic.name}</h5>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">{subTopic.description}</p>
        </div>
      </div>
      
      {/* Progress Stats */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Progresso</span>
          <span className="text-sm font-bold text-gray-900">{progress.studiedCards}/{progress.totalCards} cards</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{progress.correctCards}</div>
            <div className="text-xs text-gray-500">Acertos</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">{progress.wrongCards}</div>
            <div className="text-xs text-gray-500">Erros</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{progress.accuracy.toFixed(0)}%</div>
            <div className="text-xs text-gray-500">Assertividade</div>
          </div>
        </div>
        
        <div className="flex items-center text-xs text-gray-500 mb-4">
          <ClockIcon className="h-4 w-4 mr-2" />
          <span>Último estudo: {formatLastStudied(progress.lastStudied)}</span>
        </div>
        
        {/* Botão Aprofundar */}
        {deepening && !showDeepening && (
          <button
            onClick={() => setShowDeepening(true)}
            className="w-full mb-4 p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2 font-medium"
          >
            <AcademicCapIcon className="w-5 h-5" />
            <span>Aprofundar</span>
          </button>
        )}

        {/* Aprofundamento */}
        {deepening && showDeepening && (
          <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AcademicCapIcon className="w-5 h-5 text-blue-600" />
                <h6 className="font-semibold text-blue-900">Aprofundamento</h6>
              </div>
              <button
                onClick={() => setShowDeepening(false)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Ocultar
              </button>
            </div>
            <div 
              className="text-sm text-blue-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: deepening.content }}
            />
          </div>
        )}
        
        <button
          onClick={() => onStartStudy(subTopic)}
          className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-4 py-3 rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2 font-medium"
        >
          <PlayIcon className="h-5 w-5" />
          <span>Começar a Estudar</span>
        </button>
      </div>
    </div>
  );
}

interface StudyProgress {
  totalCards: number;
  studiedCards: number;
  correctCards: number;
  wrongCards: number;
  accuracy: number;
  lastStudied?: Date;
}

export default function StudyAreaPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subTopics, setSubTopics] = useState<SubTopic[]>([]);
  const [studyProgress, setStudyProgress] = useState<Record<string, StudyProgress>>({});

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    loadCourses();
  }, [user]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const accessibleCourses = await getCoursesWithAccess(user?.uid || '');
      setCourses(accessibleCourses || []);
      
      // Auto-select first course and load subjects directly
      if (accessibleCourses && accessibleCourses.length > 0) {
        const firstCourse = accessibleCourses[0];
        setSelectedCourse(firstCourse);
        await loadSubjects(firstCourse.id);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading courses:', error);
      setLoading(false);
    }
  };

  const loadSubjects = async (courseId: string) => {
    try {
      const subjectsData = await getSubjects(courseId);
      setSubjects(subjectsData || []);
    } catch (error) {
      console.error('Error loading subjects:', error);
      setSubjects([]);
    }
  };

  const loadTopics = async (subjectId: string) => {
    try {
      const topicsData = await getTopics(subjectId);
      setTopics(topicsData || []);
    } catch (error) {
      console.error('Error loading topics:', error);
      setTopics([]);
    }
  };

  const loadSubTopics = async (topicId: string) => {
    try {
      const subTopicsData = await getSubTopics(topicId);
      setSubTopics(subTopicsData || []);
    } catch (error) {
      console.error('Error loading sub-topics:', error);
      setSubTopics([]);
    }
  };

  const handleCourseSelect = async (course: Course) => {
    setSelectedCourse(course);
    setSelectedSubject(null);
    setSelectedTopic(null);
    setSubTopics([]);
    await loadSubjects(course.id);
  };

  const handleSubjectSelect = async (subject: Subject) => {
    setSelectedSubject(subject);
    setSelectedTopic(null);
    setSubTopics([]);
    await loadTopics(subject.id);
  };

  const handleTopicSelect = async (topic: Topic) => {
    setSelectedTopic(topic);
    setSubTopics([]);
    await loadSubTopics(topic.id);
  };

  const handleStartStudy = (subTopic: SubTopic) => {
    if (selectedCourse && selectedSubject && selectedTopic) {
      router.push(`/study?courseId=${selectedCourse.id}&subjectId=${selectedSubject.id}&topicId=${selectedTopic.id}&subTopicId=${subTopic.id}`);
    } else {
      toast.error('Erro ao iniciar estudo');
    }
  };

  const getProgressForSubTopic = async (subTopicId: string): Promise<StudyProgress> => {
    if (!user?.uid) {
      return {
        totalCards: 0,
        studiedCards: 0,
        correctCards: 0,
        wrongCards: 0,
        accuracy: 0,
        lastStudied: undefined
      };
    }

    try {
      const progress = await getUserProgressBySubTopic(user.uid, subTopicId);
      return {
        totalCards: progress.totalCards,
        studiedCards: progress.studiedCards,
        correctCards: progress.correctCards,
        wrongCards: progress.wrongCards,
        accuracy: progress.accuracy,
        lastStudied: progress.lastStudied?.toDate?.() || undefined
      };
    } catch (error) {
      console.error('Error getting progress for sub-topic:', error);
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
    if (!date) return 'Nunca estudado';
    
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora mesmo';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d atrás`;
    return date.toLocaleDateString();
  };

  const getSubjectIcon = (subjectName: string) => {
    const name = subjectName.toLowerCase();
    if (name.includes('português') || name.includes('língua')) return '📚';
    if (name.includes('direito') && name.includes('constitucional')) return '⚖️';
    if (name.includes('direito') && name.includes('administrativo')) return '🏛️';
    if (name.includes('direito') && name.includes('civil')) return '📋';
    if (name.includes('direito') && name.includes('penal')) return '🔒';
    if (name.includes('matemática')) return '🔢';
    if (name.includes('história')) return '📜';
    if (name.includes('geografia')) return '🌍';
    if (name.includes('física')) return '⚡';
    if (name.includes('química')) return '🧪';
    if (name.includes('biologia')) return '🧬';
    return '📖';
  };

  const getSubjectColor = (subjectName: string) => {
    const name = subjectName.toLowerCase();
    if (name.includes('português') || name.includes('língua')) return 'from-blue-500 to-blue-600';
    if (name.includes('direito') && name.includes('constitucional')) return 'from-red-500 to-red-600';
    if (name.includes('direito') && name.includes('administrativo')) return 'from-purple-500 to-purple-600';
    if (name.includes('direito') && name.includes('civil')) return 'from-green-500 to-green-600';
    if (name.includes('direito') && name.includes('penal')) return 'from-orange-500 to-orange-600';
    if (name.includes('matemática')) return 'from-indigo-500 to-indigo-600';
    if (name.includes('história')) return 'from-yellow-500 to-yellow-600';
    if (name.includes('geografia')) return 'from-teal-500 to-teal-600';
    return 'from-gray-500 to-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando área de estudos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Voltar ao Dashboard
            </button>
            
            <h1 className="text-xl font-bold text-gray-900">Área de Estudos</h1>
            
            <div className="flex items-center space-x-2">
              <UserCircleIcon className="w-6 h-6 text-gray-400" />
              <span className="text-sm text-gray-600">{user?.displayName || user?.email}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Selection */}
        {courses.length > 1 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <TrophyIcon className="w-6 h-6 mr-2 text-yellow-500" />
              Selecione o Curso
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => handleCourseSelect(course)}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all transform hover:scale-105 ${
                    selectedCourse?.id === course.id
                      ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                      : 'border-gray-200 hover:border-indigo-300 bg-white hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-gray-900 mb-1">{course.name}</h5>
                      <p className="text-sm text-gray-600">{course.description}</p>
                    </div>
                    <StarIcon className="h-8 w-8 text-yellow-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subject Selection */}
        {selectedCourse && subjects.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
              <AcademicCapIcon className="w-6 h-6 mr-2 text-indigo-500" />
              {selectedCourse.name} - Matérias
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  onClick={() => handleSubjectSelect(subject)}
                  className={`border-2 rounded-xl p-6 cursor-pointer transition-all transform hover:scale-105 ${
                    selectedSubject?.id === subject.id
                      ? 'border-green-500 bg-green-50 shadow-lg'
                      : 'border-gray-200 hover:border-green-300 bg-white hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <span className="text-3xl mr-3">{getSubjectIcon(subject.name)}</span>
                        <h5 className="font-bold text-gray-900 text-lg">{subject.name}</h5>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{subject.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getSubjectColor(subject.name)}`}></div>
                      <span className="text-xs text-gray-500">Clique para ver tópicos</span>
                    </div>
                    <AcademicCapIcon className="h-6 w-6 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Topic Selection */}
        {selectedSubject && topics.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
              <BookOpenIcon className="w-6 h-6 mr-2 text-purple-500" />
              {selectedSubject.name} - Tópicos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  onClick={() => handleTopicSelect(topic)}
                  className={`border-2 rounded-xl p-6 cursor-pointer transition-all transform hover:scale-105 ${
                    selectedTopic?.id === topic.id
                      ? 'border-purple-500 bg-purple-50 shadow-lg'
                      : 'border-gray-200 hover:border-purple-300 bg-white hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h5 className="font-bold text-gray-900 text-lg mb-3">{topic.name}</h5>
                      <p className="text-sm text-gray-600 leading-relaxed">{topic.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600"></div>
                      <span className="text-xs text-gray-500">Clique para ver sub-tópicos</span>
                    </div>
                    <BookOpenIcon className="h-6 w-6 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sub-Topic Selection with Progress */}
        {selectedTopic && subTopics.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
              <FireIcon className="w-6 h-6 mr-2 text-orange-500" />
              {selectedTopic.name} - Sub-tópicos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subTopics.map((subTopic) => (
                <SubTopicCard 
                  key={subTopic.id}
                  subTopic={subTopic}
                  onStartStudy={handleStartStudy}
                  getProgressForSubTopic={getProgressForSubTopic}
                  formatLastStudied={formatLastStudied}
                />
              ))}
            </div>
          </div>
        )}

        {/* No Content Message */}
        {subjects.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Nenhuma matéria disponível
            </h3>
            <p className="text-gray-600 mb-4">
              O administrador ainda não adicionou matérias para este curso.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 