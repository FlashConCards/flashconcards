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
  getUserProgressBySubTopic
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
  XCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando área de estudos...</p>
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
            
            <h1 className="text-xl font-semibold text-gray-900">Área de Estudos</h1>
            
            <div className="flex items-center space-x-2">
              <UserCircleIcon className="w-6 h-6 text-gray-400" />
              <span className="text-sm text-gray-600">{user?.displayName || user?.email}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Subject Selection */}
        {selectedCourse && subjects.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedCourse.name} - Matérias
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  onClick={() => handleSubjectSelect(subject)}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedSubject?.id === subject.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">{subject.name}</h5>
                      <p className="text-sm text-gray-600">{subject.description}</p>
                    </div>
                    <AcademicCapIcon className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Topic Selection */}
        {selectedSubject && topics.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedSubject.name} - Tópicos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  onClick={() => handleTopicSelect(topic)}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedTopic?.id === topic.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">{topic.name}</h5>
                      <p className="text-sm text-gray-600">{topic.description}</p>
                    </div>
                    <BookOpenIcon className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

                 {/* Sub-Topic Selection with Progress */}
         {selectedTopic && subTopics.length > 0 && (
           <div className="bg-white rounded-lg shadow p-6 mb-8">
             <h3 className="text-lg font-semibold text-gray-900 mb-4">
               {selectedTopic.name} - Sub-tópicos
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {subTopics.map((subTopic) => {
                 const [progress, setProgress] = useState<StudyProgress>({
                   totalCards: 0,
                   studiedCards: 0,
                   correctCards: 0,
                   wrongCards: 0,
                   accuracy: 0,
                   lastStudied: undefined
                 });

                 useEffect(() => {
                   const loadProgress = async () => {
                     const realProgress = await getProgressForSubTopic(subTopic.id);
                     setProgress(realProgress);
                   };
                   loadProgress();
                 }, [subTopic.id]);

                 return (
                   <div
                     key={subTopic.id}
                     className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                   >
                     <div className="flex items-center justify-between mb-3">
                       <h5 className="font-semibold text-gray-900">{subTopic.name}</h5>
                       <button
                         onClick={() => handleStartStudy(subTopic)}
                         className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                       >
                         <PlayIcon className="h-4 w-4" />
                         <span>Estudar</span>
                       </button>
                     </div>
                     
                     <p className="text-sm text-gray-600 mb-4">{subTopic.description}</p>
                     
                     {/* Progress Stats */}
                     <div className="space-y-2">
                       <div className="flex justify-between text-xs text-gray-600">
                         <span>Progresso</span>
                         <span>{progress.studiedCards}/{progress.totalCards} cards</span>
                       </div>
                       <div className="w-full bg-gray-200 rounded-full h-2">
                         <div
                           className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                           style={{ width: `${(progress.studiedCards / progress.totalCards) * 100}%` }}
                         ></div>
                       </div>
                       
                       <div className="grid grid-cols-3 gap-2 text-xs">
                         <div className="text-center">
                           <div className="font-semibold text-green-600">{progress.correctCards}</div>
                           <div className="text-gray-500">Acertos</div>
                         </div>
                         <div className="text-center">
                           <div className="font-semibold text-red-600">{progress.wrongCards}</div>
                           <div className="text-gray-500">Erros</div>
                         </div>
                         <div className="text-center">
                           <div className="font-semibold text-blue-600">{progress.accuracy.toFixed(0)}%</div>
                           <div className="text-gray-500">Taxa</div>
                         </div>
                       </div>
                       
                       <div className="flex items-center text-xs text-gray-500">
                         <ClockIcon className="h-3 w-3 mr-1" />
                         <span>Último estudo: {formatLastStudied(progress.lastStudied)}</span>
                       </div>
                     </div>
                   </div>
                 );
               })}
             </div>
           </div>
         )}

        {/* No Content Message */}
        {subjects.length === 0 && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
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