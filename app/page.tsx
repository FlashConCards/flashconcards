'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import {
  BookOpenIcon,
  AcademicCapIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  StarIcon,
  ArrowRightIcon,
  PlayIcon,
  ChartBarIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { getCourses, getTestimonials, getCourseRatings, getCourseComments, getAllUsers, getFlashcards, getUserAccessibleCourses } from '@/lib/firebase'
import TestimonialModal from '@/components/TestimonialModal'
import CourseRatingModal from '@/components/CourseRatingModal'
import CourseCommentModal from '@/components/CourseCommentModal'

const features = [
  {
    icon: BookOpenIcon,
    title: 'Flashcards Inteligentes',
    description: 'Sistema de repetição espaçada que adapta-se ao seu ritmo de aprendizado'
  },
  {
    icon: ChartBarIcon,
    title: 'Progresso em Tempo Real',
    description: 'Acompanhe seu desempenho com gráficos detalhados e estatísticas'
  },
  {
    icon: LightBulbIcon,
    title: 'Aprofundamento Detalhado',
    description: 'Conteúdo rico com textos explicativos para estudo completo'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Acesso Seguro',
    description: 'Plataforma protegida com autenticação e dados criptografados'
  }
]

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  
  // Estados para dados reais
  const [courses, setCourses] = useState<any[]>([])
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [courseRatings, setCourseRatings] = useState<any[]>([])
  const [courseComments, setCourseComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showTestimonialModal, setShowTestimonialModal] = useState(false)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  
  // Estados para estatísticas reais
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFlashcards: 0,
    totalCourses: 0
  })
  
  // Estado para cursos acessíveis do usuário
  const [accessibleCourses, setAccessibleCourses] = useState<string[]>([])

  // Animação automática do scroll horizontal
  useEffect(() => {
    const interval = setInterval(() => {
      setScrollPosition(prev => {
        const container = document.querySelector('.features-scroll');
        if (container) {
          const maxScroll = container.scrollWidth - container.clientWidth;
          if (prev >= maxScroll) {
            return 0; // Volta ao início
          }
          return prev + 2; // Move 2px por vez para ser mais suave
        }
        return prev;
      });
    }, 30); // Velocidade mais rápida para movimento mais suave

    return () => clearInterval(interval);
  }, []);

  // Aplicar scroll position com transição suave
  useEffect(() => {
    const container = document.querySelector('.features-scroll') as HTMLElement;
    if (container) {
      container.style.scrollBehavior = 'smooth';
      container.scrollLeft = scrollPosition;
    }
  }, [scrollPosition]);

  // Carregar dados reais do Firebase
  const loadData = async () => {
    try {
      setLoading(true)
      const [coursesData, testimonialsData, ratingsData, commentsData, usersData, flashcardsData] = await Promise.all([
        getCourses(),
        getTestimonials('approved'),
        getCourseRatings(),
        getCourseComments(),
        getAllUsers(),
        getFlashcards()
      ])
      
      setCourses(coursesData || [])
      setTestimonials(testimonialsData || [])
      setCourseRatings(ratingsData || [])
      setCourseComments(commentsData || [])
      
      // Calcular estatísticas reais
      const totalStudents = usersData?.length || 0
      const totalFlashcards = flashcardsData?.length || 0
      const totalCourses = coursesData?.length || 0
      
      setStats({
        totalStudents,
        totalFlashcards,
        totalCourses
      })

      // Carregar cursos acessíveis do usuário
      if (user) {
        try {
          const userAccessibleCourses = await getUserAccessibleCourses(user.uid)
          setAccessibleCourses(userAccessibleCourses)
        } catch (error) {
          console.error('Error loading accessible courses:', error)
          setAccessibleCourses([])
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    setIsVisible(true)
    if (testimonials && testimonials.length > 0) {
      const interval = setInterval(() => {
        setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [testimonials])

  const handleCourseClick = (courseId: string) => {
    if (!user) {
      router.push('/login')
      return
    }
    router.push('/dashboard')
  }

  const handleViewAllCourses = () => {
    if (!user) {
      router.push('/login')
    } else {
      router.push('/dashboard')
    }
  }

  const handleRateCourse = (course: any) => {
    if (!user) {
      router.push('/login')
      return
    }
    setSelectedCourse(course)
    setShowRatingModal(true)
  }

  // Verificar se o usuário tem acesso ao curso
  const userHasAccessToCourse = (courseId: string) => {
    return accessibleCourses.includes(courseId)
  }

  const handleCommentCourse = (course: any) => {
    if (!user) {
      router.push('/login')
      return
    }
    setSelectedCourse(course)
    setShowCommentModal(true)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  const getCourseAverageRating = (courseId: string) => {
    const filteredRatings = courseRatings.filter((rating: any) => rating.courseId === courseId)
    if (filteredRatings.length === 0) return 0
    
    const totalRating = filteredRatings.reduce((sum: number, rating: any) => sum + (rating.rating || 0), 0)
    return totalRating / filteredRatings.length
  }

  const getCourseCommentsCount = (courseId: string) => {
    return courseComments.filter(comment => comment.courseId === courseId).length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-4 sm:py-6">
            <div className="flex items-center justify-between w-full max-w-4xl">
              <div className="flex items-center space-x-2">
                <BookOpenIcon className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600" />
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">FlashConCards</h1>
              </div>
              <div className="flex items-center space-x-3 sm:space-x-4">
                {user ? (
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="btn-primary text-sm sm:text-base px-4 sm:px-6 py-2"
                  >
                    Dashboard
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => router.push('/login')}
                      className="text-gray-600 hover:text-gray-900 font-medium text-sm sm:text-base transition-colors"
                    >
                      Entrar
                    </button>
                    <button
                      onClick={() => router.push('/course-selection')}
                      className="btn-primary text-sm sm:text-base px-4 sm:px-6 py-2"
                    >
                      Cadastrar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              Domine os{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">
                Concursos
              </span>
              <br />
              com Flashcards Inteligentes
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
              Plataforma revolucionária que combina tecnologia de repetição espaçada com conteúdo
              rico para maximizar seu aprendizado e aprovação nos concursos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <button
                onClick={() => {
                  if (!user) {
                    router.push('/register')
                  } else {
                    router.push('/dashboard')
                  }
                }}
                className="btn-primary text-xs sm:text-sm md:text-base lg:text-lg px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 flex items-center justify-center gap-2"
              >
                <RocketLaunchIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                Começar Agora
                <ArrowRightIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </button>
              <button
                onClick={handleViewAllCourses}
                className="btn-outline text-xs sm:text-sm md:text-base lg:text-lg px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4"
              >
                Ver Cursos
              </button>
            </div>
          </motion.div>

          {/* Floating Elements */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-20 left-10 opacity-20 hidden lg:block"
          >
            <BookOpenIcon className="w-16 h-16 text-primary-400" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-40 right-20 opacity-20 hidden lg:block"
          >
            <AcademicCapIcon className="w-12 h-12 text-purple-400" />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center"
          >
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">{stats.totalCourses}</div>
              <div className="text-gray-600">Cursos Disponíveis</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">{stats.totalFlashcards}</div>
              <div className="text-gray-600">Flashcards</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">{stats.totalStudents}</div>
              <div className="text-gray-600">Estudantes</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Cursos Disponíveis
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Escolha o curso ideal para sua preparação e comece sua jornada rumo à aprovação
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {loading ? (
              <div className="col-span-full text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Carregando cursos...</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-600">Nenhum curso disponível no momento.</p>
              </div>
            ) : (
              (courses || []).map((course: any, index: number) => {
                const averageRating = getCourseAverageRating(course.id)
                const commentsCount = getCourseCommentsCount(course.id)
                const hasAccess = user ? userHasAccessToCourse(course.id) : false
                
                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                    transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300"
                    onClick={() => handleCourseClick(course.id)}
                  >
                    <div className="relative">
                      {course.image ? (
                        <img
                          src={course.image}
                          alt={course.name}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-course.jpg';
                          }}
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                          <BookOpenIcon className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                        Ativo
                      </div>
                    </div>
                    <div className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">{course.name}</h3>
                        <div className="flex items-center">
                          {renderStars(averageRating)}
                          <span className="ml-1 text-xs sm:text-sm text-gray-600">({averageRating.toFixed(1)})</span>
                        </div>
                      </div>
                      <p className="text-sm sm:text-base text-gray-600 mb-4">{course.description}</p>

                      <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 text-xs sm:text-sm">
                        <div className="flex items-center text-gray-600">
                          <BookOpenIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          {course.subjects} matérias
                        </div>
                        <div className="flex items-center text-gray-600">
                          <AcademicCapIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          {course.flashcards} flashcards
                        </div>
                        <div className="flex items-center text-gray-600">
                          <UserGroupIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          {course.students} alunos
                        </div>
                        <div className="flex items-center text-gray-600">
                          <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          {course.expirationMonths || 6} meses
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Principais Matérias:</h4>
                        <div className="flex flex-wrap gap-1">
                          {(course.features || []).map((feature: any, idx: number) => (
                            <span
                              key={idx}
                              className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                        <div className="text-xl sm:text-2xl font-bold text-primary-600">
                          R$ {course.price.toFixed(2).replace('.', ',')}
                        </div>
                        <button className="btn-primary flex items-center gap-2 text-xs sm:text-sm">
                          {!user ? 'Entrar para Comprar' : !user.isPaid ? 'Comprar Agora' : 'Acessar'}
                          <ArrowRightIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>

                      {/* Botões de avaliação e comentário */}
                      <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-200">
                        {hasAccess ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRateCourse(course)
                            }}
                            className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm text-primary-600 hover:text-primary-700 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
                          >
                            <StarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                            Avaliar
                          </button>
                        ) : (
                          <button
                            disabled
                            className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-400 border border-gray-200 rounded-lg cursor-not-allowed"
                          >
                            <StarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                            {user ? 'Sem Acesso' : 'Faça Login'}
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCommentCourse(course)
                          }}
                          className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <ChatBubbleLeftRightIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                          Comentar ({commentsCount})
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Por que escolher o FlashConCards?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tecnologia avançada combinada com metodologia comprovada para maximizar seu aprendizado
            </p>
          </motion.div>

          <div className="features-scroll flex overflow-x-auto pb-4 space-x-6 sm:space-x-8 scrollbar-hide transition-all duration-500 ease-in-out">
            {(features || []).map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                transition={{ duration: 0.8, delay: 1 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="text-center p-3 sm:p-4 rounded-lg hover:bg-gray-50 transition-all duration-300 ease-in-out min-w-[240px] sm:min-w-[260px] flex-shrink-0 transform hover:shadow-lg"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              O que nossos alunos dizem
            </h2>
            <p className="text-xl text-gray-600">
              Histórias reais de sucesso de quem confiou na nossa plataforma
            </p>
          </motion.div>

          <div className="relative">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Carregando depoimentos...</p>
              </div>
            ) : testimonials.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Nenhum depoimento disponível no momento.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    {renderStars(testimonials[activeTestimonial]?.rating || 5)}
                  </div>
                  <p className="text-lg text-gray-700 mb-6 italic">
                    "{testimonials[activeTestimonial]?.content || ''}"
                  </p>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <UserGroupIcon className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {testimonials[activeTestimonial]?.name || 'Usuário'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {testimonials[activeTestimonial]?.course || 'Estudante'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {testimonials.length > 1 && (
              <div className="flex justify-center mt-6 space-x-2">
                {(testimonials || []).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === activeTestimonial ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}

            <div className="text-center mt-8 space-y-4">
              <button
                onClick={() => router.push('/testimonials')}
                className="btn-outline flex items-center gap-2 mx-auto"
              >
                Ver Todos os Depoimentos
                <ArrowRightIcon className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setShowTestimonialModal(true)}
                className="btn-primary flex items-center gap-2 mx-auto"
              >
                Deixar Meu Depoimento
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de Testimonial */}
      {showTestimonialModal && (
        <TestimonialModal
          isOpen={showTestimonialModal}
          onClose={() => {
            setShowTestimonialModal(false);
            loadData();
          }}
          userId={user?.uid}
          userName={user?.displayName || ''}
          userEmail={user?.email || ''}
        />
      )}

      {/* Modal de Avaliação de Curso */}
      {showRatingModal && selectedCourse && (
        <CourseRatingModal
          isOpen={showRatingModal}
          onClose={() => {
            setShowRatingModal(false);
            setSelectedCourse(null);
            loadData();
          }}
          courseId={selectedCourse.id}
          courseName={selectedCourse.name}
          userId={user?.uid || ''}
          userName={user?.displayName || ''}
          userEmail={user?.email || ''}
        />
      )}

      {/* Modal de Comentário de Curso */}
      {showCommentModal && selectedCourse && (
        <CourseCommentModal
          isOpen={showCommentModal}
          onClose={() => {
            setShowCommentModal(false);
            setSelectedCourse(null);
            loadData();
          }}
          courseId={selectedCourse.id}
          courseName={selectedCourse.name}
          userId={user?.uid || ''}
          userName={user?.displayName || ''}
          userEmail={user?.email || ''}
        />
      )}

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 1.4 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Pronto para começar sua jornada?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de estudantes que já transformaram seus estudos com o FlashConCards
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  if (!user) {
                    router.push('/register')
                  } else {
                    router.push('/dashboard')
                  }
                }}
                className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RocketLaunchIcon className="w-5 h-5" />
                Começar Agora
              </button>
              <button
                onClick={() => router.push('/contact')}
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Falar Conosco
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BookOpenIcon className="w-8 h-8 text-primary-400" />
                <h3 className="text-xl font-bold">FlashConCards</h3>
              </div>
              <p className="text-gray-400">
                Plataforma revolucionária de flashcards inteligentes para concursos.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Cursos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Flashcards</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Aprofundamentos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Progresso</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/contact" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="/help" className="hover:text-white transition-colors">Ajuda</a></li>
                <li><a href="/faq" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="/tutorial" className="hover:text-white transition-colors">Tutorial</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacidade</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">Termos</a></li>
                <li><a href="/cookies" className="hover:text-white transition-colors">Cookies</a></li>
                <li><a href="/security" className="hover:text-white transition-colors">Segurança</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 FlashConCards. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 