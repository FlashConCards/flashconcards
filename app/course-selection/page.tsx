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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 gap-4 sm:gap-0">
            <div className="w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Cursos Disponíveis</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Escolha um curso e comece a estudar hoje mesmo!</p>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
              {user ? (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="btn-outline text-sm sm:text-base px-3 sm:px-4 py-2"
                >
                  Dashboard
                </button>
              ) : (
                <button
                  onClick={() => router.push('/login')}
                  className="btn-primary text-sm sm:text-base px-3 sm:px-4 py-2"
                >
                  Fazer Login
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {courses.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <AcademicCapIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Nenhum curso disponível</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 px-4">
              Em breve teremos novos cursos disponíveis. Fique atento!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                                     <div className="p-4 sm:p-6">
                     <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                       {course.name}
                     </h3>
                     <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-3">
                       {course.description}
                     </p>
                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                       <span className="text-2xl sm:text-3xl font-bold text-primary-600">
                         R$ {course.price?.toFixed(2).replace('.', ',') || '0,00'}
                       </span>
                       <div className="flex items-center gap-2">
                         {hasAccess ? (
                           <>
                             <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                             <span className="text-xs sm:text-sm font-medium text-green-600">Disponível</span>
                           </>
                         ) : (
                           <>
                             <ShoppingCartIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                             <span className="text-xs sm:text-sm font-medium text-primary-600">Comprar</span>
                           </>
                         )}
                       </div>
                     </div>
                     {course.expirationMonths && (
                       <p className="text-xs sm:text-sm text-gray-500 mt-2">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-auto">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
              Escolha a forma de pagamento
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              {selectedCourse.name} - R$ {selectedCourse.price?.toFixed(2).replace('.', ',')}
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => handlePayment('pix')}
                className="w-full flex items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <QrCodeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                <span className="text-sm sm:text-base font-medium">Pagar com PIX</span>
              </button>
              
              <button
                onClick={() => handlePayment('credit')}
                className="w-full flex items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <CreditCardIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                <span className="text-sm sm:text-base font-medium">Cartão de Crédito (até 10x)</span>
              </button>
            </div>
            
            <button
              onClick={() => setShowPaymentModal(false)}
              className="w-full mt-4 p-3 text-sm sm:text-base text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 