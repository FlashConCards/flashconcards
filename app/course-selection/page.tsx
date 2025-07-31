'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { getCoursesWithAccess, updateUser } from '@/lib/firebase';
import { Course } from '@/types';
import { BookOpenIcon, CheckIcon } from '@heroicons/react/24/outline';

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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando cursos...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <BookOpenIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Selecione seu Curso
          </h1>
          <p className="text-lg text-gray-600">
            Escolha o curso que você deseja estudar
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum curso disponível
            </h3>
            <p className="text-gray-600 mb-6">
              Você ainda não tem acesso a nenhum curso. Entre em contato com o administrador.
            </p>
            <button
              onClick={() => router.push('/courses')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ver Cursos Disponíveis
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                onClick={() => handleCourseSelect(course)}
                className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all ${
                  selectedCourse?.id === course.id
                    ? 'ring-2 ring-blue-500 bg-blue-50'
                    : 'hover:shadow-lg'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <BookOpenIcon className="h-8 w-8 text-blue-600" />
                  {selectedCourse?.id === course.id && (
                    <CheckIcon className="h-6 w-6 text-blue-600" />
                  )}
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {course.name}
                </h3>
                
                <p className="text-gray-600 mb-4">
                  {course.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {course.price ? `R$ ${course.price.toFixed(2).replace('.', ',')}` : 'Gratuito'}
                  </span>
                  
                  {selectedCourse?.id === course.id && (
                    <span className="text-sm font-medium text-blue-600">
                      Selecionado
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedCourse && (
          <div className="mt-8 text-center">
            <button
              onClick={handleContinue}
              disabled={saving}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  Continuar para o Dashboard
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 