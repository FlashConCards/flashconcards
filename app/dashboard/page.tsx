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
  createStudySession,
  updateUserProgress,
  getUserProgress,
  onCoursesChange,
  getTestimonials,
  getCoursesWithAccess
} from '@/lib/firebase';
import { Course, Subject, Topic, SubTopic, Flashcard } from '@/types';
import { 
  BookOpenIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  StarIcon,
  PlayIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Testimonial {
  id: string;
  name: string;
  content: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedSubTopic, setSelectedSubTopic] = useState<SubTopic | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subTopics, setSubTopics] = useState<SubTopic[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    photoURL: user?.photoURL || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Check if user has access
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    console.log('Dashboard loaded for user:', user?.email);
  }, [user, router]);

  // Load courses with access control
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        console.log('Loading courses for user:', user?.uid);
        const accessibleCourses = await getCoursesWithAccess(user?.uid || '');
        console.log('Accessible courses:', accessibleCourses);
        setCourses(accessibleCourses || []);
        
        // Se o usuário tem apenas um curso, selecionar automaticamente
        if (accessibleCourses && accessibleCourses.length === 1) {
          console.log('Auto-selecting course:', accessibleCourses[0].name);
          setSelectedCourse(accessibleCourses[0]);
          const subjectsData = await getSubjects(accessibleCourses[0].id);
          console.log('Subjects loaded:', subjectsData);
          setSubjects(subjectsData || []);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading courses:', error);
        setCourses([]);
        setLoading(false);
      }
    };

    if (user) {
      loadCourses();
    }
  }, [user]);

  // Load testimonials
  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const testimonialsData = await getTestimonials('approved');
        setTestimonials(testimonialsData || []);
      } catch (error) {
        console.error('Error loading testimonials:', error);
        setTestimonials([]);
      }
    };

    loadTestimonials();
  }, []);

  // Load subjects when course is selected
  useEffect(() => {
    if (selectedCourse) {
      const loadSubjects = async () => {
        try {
          console.log('Loading subjects for course:', selectedCourse.id);
          const subjectsData = await getSubjects(selectedCourse.id);
          console.log('Subjects loaded:', subjectsData);
          setSubjects(subjectsData || []);
        } catch (error) {
          console.error('Error loading subjects:', error);
          setSubjects([]);
        }
      };

      loadSubjects();
    }
  }, [selectedCourse]);

  // Load topics when subject is selected
  useEffect(() => {
    if (selectedSubject) {
      const loadTopics = async () => {
        try {
          const topicsData = await getTopics(selectedSubject.id);
          setTopics(topicsData || []);
        } catch (error) {
          console.error('Error loading topics:', error);
          setTopics([]);
        }
      };

      loadTopics();
    }
  }, [selectedSubject]);

  // Load sub-topics when topic is selected
  useEffect(() => {
    if (selectedTopic) {
      const loadSubTopics = async () => {
        try {
          const subTopicsData = await getSubTopics(selectedTopic.id);
          setSubTopics(subTopicsData || []);
        } catch (error) {
          console.error('Error loading sub-topics:', error);
          setSubTopics([]);
        }
      };

      loadSubTopics();
    }
  }, [selectedTopic]);

  // Load flashcards when sub-topic is selected
  useEffect(() => {
    if (selectedSubTopic) {
      const loadFlashcards = async () => {
        try {
          const flashcardsData = await getFlashcards(selectedSubTopic.id);
          setFlashcards(flashcardsData || []);
        } catch (error) {
          console.error('Error loading flashcards:', error);
          setFlashcards([]);
        }
      };

      loadFlashcards();
    }
  }, [selectedSubTopic]);

  const handleStartStudy = () => {
    if (selectedCourse && selectedSubject && selectedTopic && selectedSubTopic) {
      router.push(`/study?courseId=${selectedCourse.id}&subjectId=${selectedSubject.id}&topicId=${selectedTopic.id}&subTopicId=${selectedSubTopic.id}`);
    } else {
      toast.error('Selecione um curso, matéria, tópico e sub-tópico para começar a estudar');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      // Implementar atualização do perfil
      toast.success('Perfil atualizado com sucesso!');
      setShowProfileModal(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil');
    }
  };

  const handleUpdatePassword = async () => {
    try {
      // Implementar atualização de senha
      toast.success('Senha atualizada com sucesso!');
      setShowPasswordModal(false);
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Erro ao atualizar senha');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 gap-4 sm:gap-0">
            <div className="flex items-center">
              <BookOpenIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <h1 className="ml-2 text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <button
                onClick={() => router.push('/dashboard/study-area')}
                className="flex items-center justify-center sm:justify-start space-x-2 bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
              >
                <BookOpenIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Área de Estudos</span>
              </button>
              
              <button
                onClick={() => router.push('/dashboard/stats')}
                className="flex items-center justify-center sm:justify-start space-x-2 bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
              >
                <ChartBarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Estatísticas</span>
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center justify-center sm:justify-start space-x-2 text-gray-700 hover:text-gray-900 w-full sm:w-auto px-3 py-2 rounded-lg hover:bg-gray-100"
                >
                  <UserCircleIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="text-sm sm:text-base truncate">{user.displayName || user.email}</span>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <button
                      onClick={() => setShowProfileModal(true)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Editar Perfil
                    </button>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Alterar Senha
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Sair
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Bem-vindo, {user.displayName || user.email}!
          </h2>
          <p className="text-gray-600">
            Selecione um curso para começar seus estudos.
          </p>
        </div>

        {/* Course Selection */}
        {courses.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Seus Cursos</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {courses.map((course) => (
                 <div
                   key={course.id}
                   onClick={() => setSelectedCourse(course)}
                   className={`border rounded-lg cursor-pointer transition-all overflow-hidden ${
                     selectedCourse?.id === course.id
                       ? 'border-blue-500 bg-blue-50 shadow-lg'
                       : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                   }`}
                 >
                   {/* Imagem do curso */}
                   <div className="aspect-video bg-gray-200 relative overflow-hidden">
                     {course.image ? (
                       <img
                         src={course.image}
                         alt={course.name}
                         className="w-full h-full object-cover"
                         onError={(e) => {
                           e.currentTarget.src = '/placeholder-course.jpg';
                         }}
                       />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center bg-gray-100">
                         <BookOpenIcon className="h-12 w-12 text-gray-400" />
                       </div>
                     )}
                   </div>
                   
                   <div className="p-4">
                     <h4 className="font-semibold text-gray-900 mb-2">{course.name}</h4>
                     <p className="text-sm text-gray-600">{course.description}</p>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        )}

        {/* Course Content */}
        {selectedCourse && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedCourse.name} - Conteúdo
              </h3>
              <button
                onClick={() => router.push('/study')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2"
              >
                <PlayIcon className="h-5 w-5" />
                <span>Ir para Estudos</span>
              </button>
            </div>
            
            {/* Subjects */}
            {subjects.length > 0 ? (
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-gray-800">Matérias</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subjects.map((subject) => (
                    <div
                      key={subject.id}
                      onClick={() => setSelectedSubject(subject)}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedSubject?.id === subject.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <h5 className="font-semibold text-gray-900 mb-2">{subject.name}</h5>
                      <p className="text-sm text-gray-600">{subject.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhuma matéria disponível
                </h4>
                <p className="text-gray-600 mb-4">
                  O administrador ainda não adicionou matérias para este curso.
                </p>
                <p className="text-sm text-gray-500">
                  Entre em contato com o administrador para solicitar o conteúdo.
                </p>
              </div>
            )}

            {/* Topics */}
            {selectedSubject && topics.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Tópicos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {topics.map((topic) => (
                    <div
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedTopic?.id === topic.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <h5 className="font-medium text-gray-900">{topic.name}</h5>
                      <p className="text-xs text-gray-600 mt-1">{topic.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SubTopics */}
            {selectedTopic && subTopics.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Sub-tópicos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {subTopics.map((subTopic) => (
                    <div
                      key={subTopic.id}
                      onClick={() => setSelectedSubTopic(subTopic)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedSubTopic?.id === subTopic.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <h5 className="font-medium text-gray-900">{subTopic.name}</h5>
                      <p className="text-xs text-gray-600 mt-1">{subTopic.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Study Button */}
            {selectedCourse && selectedSubject && selectedTopic && selectedSubTopic && (
              <div className="mt-6">
                <button
                  onClick={handleStartStudy}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <PlayIcon className="h-5 w-5" />
                  <span>Começar a Estudar</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Depoimentos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`h-4 w-4 ${
                            i < testimonial.rating ? 'fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm mb-2">{testimonial.content}</p>
                  <p className="text-gray-500 text-xs font-medium">{testimonial.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Courses Message */}
        {courses.length === 0 && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum curso disponível</h3>
            <p className="text-gray-600 mb-4">
              Você ainda não tem acesso a nenhum curso. Entre em contato com o administrador.
            </p>
            <button
              onClick={() => router.push('/course-selection')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ver Cursos Disponíveis
            </button>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Editar Perfil</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={profileData.displayName}
                  onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateProfile}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Alterar Senha</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha Atual
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nova Senha
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdatePassword}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Alterar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 