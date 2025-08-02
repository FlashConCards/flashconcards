'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { 
  AcademicCapIcon,
  ShoppingCartIcon,
  CreditCardIcon,
  QrCodeIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { getPublicCourses, getCoursesWithAccess } from '@/lib/firebase';
import { Course } from '@/types';
import toast from 'react-hot-toast';

export default function CourseSelectionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [userCourses, setUserCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Carregar cursos públicos e cursos do usuário
  const loadCourses = async () => {
    try {
      setLoading(true);
      const publicCourses = await getPublicCourses();
      console.log('📚 Cursos públicos carregados:', publicCourses);
      
      // Log das imagens dos cursos
      publicCourses.forEach((course, index) => {
        console.log(`Curso ${index + 1}:`, {
          name: course.name,
          image: course.image,
          hasImage: !!course.image
        });
      });
      
      setCourses(publicCourses);
      
      // Se o usuário está logado, carregar seus cursos
      if (user) {
        const accessibleCourses = await getCoursesWithAccess(user.uid);
        setUserCourses(accessibleCourses || []);
      }
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
      toast.error('Erro ao carregar cursos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, [user]);

  // Verificar se o usuário já possui acesso ao curso
  const hasCourseAccess = (courseId: string) => {
    return userCourses.some(course => course.id === courseId);
  };

  const handleCourseSelect = (course: Course) => {
    // Se o usuário já possui acesso, redirecionar para o dashboard
    if (hasCourseAccess(course.id)) {
      toast.success('Você já possui acesso a este curso!');
      router.push('/dashboard');
      return;
    }
    
    setSelectedCourse(course);
    setShowPaymentModal(true);
  };

  const handlePayment = async (paymentMethod: 'pix' | 'credit') => {
    if (!user || !selectedCourse) {
      toast.error('Erro ao processar pagamento');
      return;
    }

    try {
      // Criar pagamento no Mercado Pago
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: selectedCourse.id,
          courseName: selectedCourse.name,
          amount: selectedCourse.price || 0,
          paymentMethod: paymentMethod,
          userId: user.uid,
          userEmail: user.email,
          userName: user.displayName
        })
      });

      const result = await response.json();

      if (response.ok) {
        if (paymentMethod === 'pix') {
          // Redirecionar para página de PIX
          router.push(`/payment?paymentId=${result.paymentId}&method=pix`);
        } else {
          // Redirecionar para página de cartão
          router.push(`/payment?paymentId=${result.paymentId}&method=credit`);
        }
      } else {
        toast.error(result.error || 'Erro ao criar pagamento');
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast.error('Erro ao processar pagamento');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando cursos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cursos Disponíveis</h1>
              <p className="text-gray-600">Escolha um curso e comece a estudar hoje mesmo!</p>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="btn-outline"
                >
                  Dashboard
                </button>
              ) : (
                <button
                  onClick={() => router.push('/login')}
                  className="btn-primary"
                >
                  Fazer Login
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <AcademicCapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum curso disponível</h3>
            <p className="text-gray-600 mb-4">
              Em breve teremos novos cursos disponíveis. Fique atento!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const hasAccess = hasCourseAccess(course.id);
              
              return (
                <div
                  key={course.id}
                  className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer ${
                    hasAccess ? 'ring-2 ring-green-500' : ''
                  }`}
                  onClick={() => handleCourseSelect(course)}
                >
                                     <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center relative overflow-hidden">
                     {course.image ? (
                       <img
                         src={course.image}
                         alt={course.name}
                         className="w-full h-full object-cover"
                         onError={(e) => {
                           e.currentTarget.style.display = 'none';
                           e.currentTarget.nextElementSibling?.classList.remove('hidden');
                         }}
                       />
                     ) : null}
                     <div className={`w-full h-full flex items-center justify-center ${course.image ? 'hidden' : ''}`}>
                       <AcademicCapIcon className="w-16 h-16 text-white" />
                     </div>
                     {hasAccess && (
                       <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                         DISPONÍVEL
                       </div>
                     )}
                   </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {course.name}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold text-primary-600">
                        R$ {course.price?.toFixed(2).replace('.', ',') || '0,00'}
                      </span>
                      <div className="flex items-center gap-2">
                        {hasAccess ? (
                          <>
                            <CheckCircleIcon className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-green-600">Disponível</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCartIcon className="w-5 h-5 text-primary-600" />
                            <span className="text-sm font-medium text-primary-600">Comprar</span>
                          </>
                        )}
                      </div>
                    </div>
                    {course.expirationMonths && (
                      <p className="text-sm text-gray-500 mt-2">
                        Acesso por {course.expirationMonths} meses
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Pagamento */}
      {showPaymentModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Escolha a forma de pagamento
            </h3>
            <p className="text-gray-600 mb-6">
              {selectedCourse.name} - R$ {selectedCourse.price?.toFixed(2).replace('.', ',')}
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => handlePayment('pix')}
                className="w-full flex items-center justify-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <QrCodeIcon className="w-6 h-6 text-green-600" />
                <span className="font-medium">Pagar com PIX</span>
              </button>
              
              <button
                onClick={() => handlePayment('credit')}
                className="w-full flex items-center justify-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <CreditCardIcon className="w-6 h-6 text-blue-600" />
                <span className="font-medium">Cartão de Crédito (até 10x)</span>
              </button>
            </div>
            
            <button
              onClick={() => setShowPaymentModal(false)}
              className="w-full mt-4 p-3 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 