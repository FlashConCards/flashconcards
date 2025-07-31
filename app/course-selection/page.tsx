'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { getCoursesWithAccess, updateUser } from '@/lib/firebase';
import { Course } from '@/types';
import { 
  BookOpenIcon, 
  CheckIcon, 
  AcademicCapIcon,
  StarIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export default function CourseSelectionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const loadCourses = async () => {
      try {
        setLoading(true);
        const accessibleCourses = await getCoursesWithAccess(user.uid);
        setCourses(accessibleCourses || []);
        
        // Se o usuário tem apenas um curso, selecionar automaticamente
        if (accessibleCourses && accessibleCourses.length === 1) {
          setSelectedCourse(accessibleCourses[0]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar cursos:', error);
        setCourses([]);
        setLoading(false);
      }
    };

    loadCourses();
  }, [user, router]);

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
  };

  const handleContinue = async () => {
    if (!selectedCourse || !user) return;

    try {
      setSaving(true);
      
      // Atualizar o curso selecionado do usuário
      await updateUser(user.uid, {
        selectedCourse: selectedCourse.id
      });

      // Redirecionar para o dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Erro ao salvar curso selecionado:', error);
      alert('Erro ao salvar seleção. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Carregando seus cursos...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header com gradiente */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <AcademicCapIcon className="h-16 w-16 text-yellow-300 mr-4" />
              <SparklesIcon className="h-8 w-8 text-yellow-300" />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Bem-vindo ao FlashConCards!
            </h1>
            <p className="text-xl text-blue-100 mb-2">
              Olá, <span className="font-semibold">{user.displayName || user.email}</span>
            </p>
            <p className="text-lg text-blue-200">
              Escolha o curso que você deseja estudar e comece sua jornada de aprendizado
            </p>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {courses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md mx-auto">
            <div className="bg-gradient-to-r from-red-100 to-pink-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <BookOpenIcon className="h-10 w-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Nenhum curso disponível
            </h3>
            <p className="text-gray-600 mb-8">
              Você ainda não tem acesso a nenhum curso. Entre em contato com o administrador para obter acesso.
            </p>
            <button
              onClick={() => router.push('/courses')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              Ver Cursos Disponíveis
            </button>
          </div>
        ) : (
          <>
            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <BookOpenIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{courses.length}</h3>
                <p className="text-gray-600">Cursos Disponíveis</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <StarIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Premium</h3>
                <p className="text-gray-600">Conteúdo Exclusivo</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <UserGroupIcon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Comunidade</h3>
                <p className="text-gray-600">Suporte Completo</p>
              </div>
            </div>

            {/* Título da seção */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Seus Cursos Disponíveis
              </h2>
              <p className="text-lg text-gray-600">
                Clique em um curso para selecioná-lo e começar seus estudos
              </p>
            </div>

            {/* Grid de cursos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => handleCourseSelect(course)}
                  className={`bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                    selectedCourse?.id === course.id
                      ? 'ring-4 ring-blue-500 shadow-2xl'
                      : 'hover:shadow-xl'
                  }`}
                >
                  {/* Imagem do curso */}
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                    {course.image ? (
                      <img
                        src={course.image}
                        alt={course.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 ${course.image ? 'hidden' : ''}`}>
                      <BookOpenIcon className="h-16 w-16 text-blue-500" />
                    </div>
                    
                    {/* Badge de selecionado */}
                    {selectedCourse?.id === course.id && (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                        <CheckIcon className="h-4 w-4 mr-1" />
                        Selecionado
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {course.name}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-green-600">
                        {course.price ? `R$ ${course.price.toFixed(2).replace('.', ',')}` : 'Gratuito'}
                      </span>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        <span>Flexível</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Botão de continuar */}
            {selectedCourse && (
              <div className="mt-12 text-center">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Curso Selecionado
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Você selecionou: <span className="font-semibold text-blue-600">{selectedCourse.name}</span>
                  </p>
                  <button
                    onClick={handleContinue}
                    disabled={saving}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        Continuar para o Dashboard
                        <ArrowRightIcon className="h-5 w-5 ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 