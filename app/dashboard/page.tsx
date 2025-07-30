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
  onCoursesChange
} from '@/lib/firebase';
import { Course, Subject, Topic, SubTopic, Flashcard } from '@/types';
import { 
  BookOpenIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

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
    if (user && !user.isPaid && !user.isAdmin && !(user as any).createdByAdmin) {
      router.push('/payment')
      return
    }
  }, [user, router]);

  // Load courses in real-time
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const coursesData = await getCourses();
        setCourses(coursesData || []);
        setLoading(false);
      } catch (error) {
        console.error('Error loading courses:', error);
        setCourses([]);
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  // Load subjects when course is selected
  useEffect(() => {
    if (selectedCourse) {
      const loadSubjects = async () => {
        try {
          // Temporariamente usando dados mockados até o Firebase estar configurado
          const mockSubjects: Subject[] = [
            {
              id: '1',
              courseId: selectedCourse.id,
              name: 'Direito Constitucional',
              description: 'Princípios fundamentais da Constituição',
              order: 1,
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: '2',
              courseId: selectedCourse.id,
              name: 'Direito Administrativo',
              description: 'Organização administrativa e atos administrativos',
              order: 2,
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ];
          setSubjects(mockSubjects);
        } catch (error) {
          console.error('Error loading subjects:', error);
        }
      };
      loadSubjects();
    }
  }, [selectedCourse]);

  // Load topics when subject is selected
  useEffect(() => {
    if (selectedCourse && selectedSubject) {
      const loadTopics = async () => {
        try {
          // Temporariamente usando dados mockados
          const mockTopics: Topic[] = [
            {
              id: '1',
              subjectId: selectedSubject.id,
              name: 'Princípios Fundamentais',
              description: 'Fundamentos da República',
              order: 1,
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: '2',
              subjectId: selectedSubject.id,
              name: 'Direitos e Garantias',
              description: 'Direitos fundamentais',
              order: 2,
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ];
          setTopics(mockTopics);
        } catch (error) {
          console.error('Error loading topics:', error);
        }
      };
      loadTopics();
    }
  }, [selectedCourse, selectedSubject]);

  // Load sub-topics when topic is selected
  useEffect(() => {
    if (selectedCourse && selectedSubject && selectedTopic) {
      const loadSubTopics = async () => {
        try {
          // Temporariamente usando dados mockados
          const mockSubTopics: SubTopic[] = [
            {
              id: '1',
              topicId: selectedTopic.id,
              name: 'Soberania Popular',
              description: 'Poder emana do povo',
              order: 1,
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: '2',
              topicId: selectedTopic.id,
              name: 'Separação de Poderes',
              description: 'Independência entre os poderes',
              order: 2,
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ];
          setSubTopics(mockSubTopics);
        } catch (error) {
          console.error('Error loading sub-topics:', error);
        }
      };
      loadSubTopics();
    }
  }, [selectedCourse, selectedSubject, selectedTopic]);

  // Load flashcards when sub-topic is selected
  useEffect(() => {
    if (selectedCourse && selectedSubject && selectedTopic && selectedSubTopic) {
      const loadFlashcards = async () => {
        try {
          // Temporariamente usando dados mockados
          const mockFlashcards: Flashcard[] = [
            {
              id: '1',
              subTopicId: selectedSubTopic.id,
              front: 'O que é a soberania popular?',
              back: 'É o princípio de que o poder emana do povo',
              explanation: 'A soberania popular é o fundamento da democracia',
              isActive: true,
              order: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: '2',
              subTopicId: selectedSubTopic.id,
              front: 'Como se expressa a soberania popular?',
              back: 'Através do voto direto, secreto, universal e periódico',
              explanation: 'O voto é o instrumento de expressão da soberania',
              isActive: true,
              order: 2,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ];
          setFlashcards(mockFlashcards);
        } catch (error) {
          console.error('Error loading flashcards:', error);
        }
      };
      loadFlashcards();
    }
  }, [selectedCourse, selectedSubject, selectedTopic, selectedSubTopic]);

  const handleStartStudy = () => {
    if (!selectedSubTopic) {
      toast.error('Selecione um sub-tópico para começar a estudar');
      return;
    }

    if (flashcards.length === 0) {
      toast.error('Não há flashcards disponíveis para este sub-tópico');
      return;
    }

    // Save study session
    if (user && selectedCourse && selectedSubject && selectedTopic && selectedSubTopic) {
      createStudySession({
        uid: user.uid,
        courseId: selectedCourse.id,
        courseName: selectedCourse.name,
        subjectId: selectedSubject.id,
        subjectName: selectedSubject.name,
        topicId: selectedTopic.id,
        topicName: selectedTopic.name,
        subTopicId: selectedSubTopic.id,
        subTopicName: selectedSubTopic.name,
        flashcardsCount: flashcards.length,
        startTime: new Date()
      })
    }

    router.push('/study');
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
      toast.success('Logout realizado com sucesso');
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      // Update profile logic would go here
      toast.success('Perfil atualizado com sucesso');
      setShowProfileModal(false);
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
    }
  };

  const handleUpdatePassword = async () => {
    if (!user) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      // Update password logic would go here
      toast.success('Senha atualizada com sucesso');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error('Erro ao atualizar senha');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">FlashConCards</h1>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full" />
                ) : (
                  <UserCircleIcon className="w-8 h-8" />
                )}
                <span className="hidden md:block">{user.displayName}</span>
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
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <BookOpenIcon className="w-8 h-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cards Estudados</p>
                <p className="text-2xl font-semibold text-gray-900">{user.cardsStudied}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ClockIcon className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tempo de Estudo</p>
                <p className="text-2xl font-semibold text-gray-900">{Math.round(user.studyTime / 60)}min</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Acertos</p>
                <p className="text-2xl font-semibold text-gray-900">{user.cardsCorrect}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <XCircleIcon className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Erros</p>
                <p className="text-2xl font-semibold text-gray-900">{user.cardsWrong}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Course Selection */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Selecionar Conteúdo para Estudar</h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Course Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Curso</label>
                <select
                  value={selectedCourse?.id || ''}
                  onChange={(e) => {
                    const course = courses.find(c => c.id === e.target.value);
                    setSelectedCourse(course || null);
                    setSelectedSubject(null);
                    setSelectedTopic(null);
                    setSelectedSubTopic(null);
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Selecione um curso</option>
                  {(courses || []).map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Matéria</label>
                <select
                  value={selectedSubject?.id || ''}
                  onChange={(e) => {
                    const subject = subjects.find(s => s.id === e.target.value);
                    setSelectedSubject(subject || null);
                    setSelectedTopic(null);
                    setSelectedSubTopic(null);
                  }}
                  disabled={!selectedCourse}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                >
                  <option value="">Selecione uma matéria</option>
                  {(subjects || []).map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Topic Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tópico</label>
                <select
                  value={selectedTopic?.id || ''}
                  onChange={(e) => {
                    const topic = topics.find(t => t.id === e.target.value);
                    setSelectedTopic(topic || null);
                    setSelectedSubTopic(null);
                  }}
                  disabled={!selectedSubject}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                >
                  <option value="">Selecione um tópico</option>
                  {(topics || []).map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub-topic Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sub-tópico</label>
                <select
                  value={selectedSubTopic?.id || ''}
                  onChange={(e) => {
                    const subTopic = subTopics.find(st => st.id === e.target.value);
                    setSelectedSubTopic(subTopic || null);
                  }}
                  disabled={!selectedTopic}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                >
                  <option value="">Selecione um sub-tópico</option>
                  {(subTopics || []).map((subTopic) => (
                    <option key={subTopic.id} value={subTopic.id}>
                      {subTopic.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Start Study Button */}
            <div className="mt-6">
              <button
                onClick={handleStartStudy}
                disabled={!selectedSubTopic || flashcards.length === 0}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectedSubTopic && flashcards.length > 0 
                  ? `Começar a Estudar (${flashcards.length} cards)`
                  : 'Selecione um sub-tópico para começar'
                }
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Editar Perfil</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <input
                  type="text"
                  value={profileData.displayName}
                  onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">URL da Foto</label>
                <input
                  type="url"
                  value={profileData.photoURL}
                  onChange={(e) => setProfileData({ ...profileData, photoURL: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
            <div className="mt-6 flex space-x-3">
              <button
                onClick={handleUpdateProfile}
                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
              >
                Salvar
              </button>
              <button
                onClick={() => setShowProfileModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Alterar Senha</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Senha Atual</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nova Senha</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirmar Nova Senha</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
            <div className="mt-6 flex space-x-3">
              <button
                onClick={handleUpdatePassword}
                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
              >
                Alterar Senha
              </button>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 