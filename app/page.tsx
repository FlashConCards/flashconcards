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
  RocketLaunchIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { getCourses, getTestimonials } from '@/lib/firebase'

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
    description: 'Conteúdo rico com imagens, vídeos e PDFs para estudo completo'
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
  
  // Estados para dados reais
  const [courses, setCourses] = useState<any[]>([])
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Carregar dados reais do Firebase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [coursesData, testimonialsData] = await Promise.all([
          getCourses(),
          getTestimonials('approved')
        ])
        setCourses(coursesData || [])
        setTestimonials(testimonialsData || [])
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

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
    // Remover verificação de pagamento - ir direto para dashboard
    router.push('/dashboard')
  }

  const handleViewAllCourses = () => {
    if (!user) {
      router.push('/login')
    } else {
      // Remover verificação de pagamento - ir direto para dashboard
      router.push('/dashboard')
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <BookOpenIcon className="w-8 h-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">FlashConCards</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="btn-primary"
                >
                  Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => router.push('/login')}
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Entrar
                  </button>
                  <button
                    onClick={() => router.push('/register')}
                    className="btn-primary"
                  >
                    Cadastrar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Domine os{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">
                Concursos
              </span>
              <br />
              com Flashcards Inteligentes
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Plataforma revolucionária que combina tecnologia de repetição espaçada com conteúdo
              rico para maximizar seu aprendizado e aprovação nos concursos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  if (!user) {
                    router.push('/register')
                  } else {
                    // Remover verificação de pagamento - ir direto para dashboard
                    router.push('/dashboard')
                  }
                }}
                className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2"
              >
                <RocketLaunchIcon className="w-6 h-6" />
                Começar Agora
                <ArrowRightIcon className="w-5 h-5" />
              </button>
              <button
                onClick={handleViewAllCourses}
                className="btn-outline text-lg px-8 py-4"
              >
                Ver Cursos
              </button>
            </div>
          </motion.div>

          {/* Floating Elements */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-20 left-10 opacity-20"
          >
            <BookOpenIcon className="w-16 h-16 text-primary-400" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-40 right-20 opacity-20"
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
            className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center"
          >
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">{courses.length}</div>
              <div className="text-gray-600">Cursos Disponíveis</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">730</div>
              <div className="text-gray-600">Flashcards</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">4.2k</div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
              (courses || []).map((course: any, index: number) => (
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
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{course.name}</h3>
                      <div className="flex items-center">
                        {renderStars(course.rating)}
                        <span className="ml-1 text-sm text-gray-600">({course.rating})</span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{course.description}</p>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <BookOpenIcon className="w-4 h-4 mr-2" />
                        {course.subjects} matérias
                      </div>
                      <div className="flex items-center text-gray-600">
                        <AcademicCapIcon className="w-4 h-4 mr-2" />
                        {course.flashcards} flashcards
                      </div>
                      <div className="flex items-center text-gray-600">
                        <UserGroupIcon className="w-4 h-4 mr-2" />
                        {course.students} alunos
                      </div>
                      <div className="flex items-center text-gray-600">
                        <ClockIcon className="w-4 h-4 mr-2" />
                        Acesso vitalício
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Principais Matérias:</h4>
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

                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-primary-600">
                        R$ {course.price.toFixed(2).replace('.', ',')}
                      </div>
                      <button className="btn-primary flex items-center gap-2">
                        {!user ? 'Entrar para Comprar' : !user.isPaid ? 'Comprar Agora' : 'Acessar'}
                        <ArrowRightIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {(features || []).map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                transition={{ duration: 0.8, delay: 1 + index * 0.1 }}
                whileHover={{ y: -5 }}
                className="text-center p-6 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
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

            <div className="text-center mt-8">
              <button
                onClick={() => router.push('/testimonials')}
                className="btn-outline flex items-center gap-2 mx-auto"
              >
                Ver Todos os Depoimentos
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

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
                    // Remover verificação de pagamento - ir direto para dashboard
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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