'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { 
  BookOpenIcon, 
  AcademicCapIcon,
  ChevronRightIcon,
  PlayIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'
import { getCoursesWithAccess, getSubjects, getTopics, getSubTopics } from '@/lib/firebase'
import { Course, Subject, Topic, SubTopic } from '@/types'
import toast from 'react-hot-toast'

export default function CoursesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [subTopics, setSubTopics] = useState<SubTopic[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [loading, setLoading] = useState(true)

  // Carregar cursos com controle de acesso
  const loadCourses = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const accessibleCourses = await getCoursesWithAccess(user.uid)
      setCourses(accessibleCourses || [])
    } catch (error) {
      console.error('Erro ao carregar cursos:', error)
    } finally {
      setLoading(false)
    }
  }

  // Carregar matérias do curso selecionado
  const loadSubjects = async (courseId: string) => {
    try {
      const subjectsData = await getSubjects(courseId)
      setSubjects(subjectsData || [])
    } catch (error) {
      console.error('Erro ao carregar matérias:', error)
    }
  }

  // Carregar tópicos da matéria selecionada
  const loadTopics = async (subjectId: string) => {
    try {
      const topicsData = await getTopics(subjectId)
      setTopics(topicsData || [])
    } catch (error) {
      console.error('Erro ao carregar tópicos:', error)
    }
  }

  // Carregar sub-tópicos do tópico selecionado
  const loadSubTopics = async (topicId: string) => {
    try {
      const subTopicsData = await getSubTopics(topicId)
      setSubTopics(subTopicsData || [])
    } catch (error) {
      console.error('Erro ao carregar sub-tópicos:', error)
    }
  }

  useEffect(() => {
    if (user) {
      loadCourses()
    }
  }, [user])

  const handleCourseSelect = async (course: Course) => {
    setSelectedCourse(course)
    setSelectedSubject(null)
    setSelectedTopic(null)
    setSubTopics([])
    await loadSubjects(course.id)
  }

  const handleSubjectSelect = async (subject: Subject) => {
    setSelectedSubject(subject)
    setSelectedTopic(null)
    setSubTopics([])
    await loadTopics(subject.id)
  }

  const handleTopicSelect = async (topic: Topic) => {
    setSelectedTopic(topic)
    await loadSubTopics(topic.id)
  }

  const handleStartStudy = () => {
    if (selectedTopic) {
      router.push(`/study?topicId=${selectedTopic.id}`)
    } else {
      router.push('/study')
    }
  }

  // Verificar se usuário tem acesso ao curso
  const hasCourseAccess = (courseId: string) => {
    if (!user) return false
    if (user.isAdmin) return true
    if (!user.isPaid) return false // Usuários não pagos não têm acesso
    
    // Verificar se o curso está na lista de cursos acessíveis
    return courses.some(course => course.id === courseId)
  }

  // Verificar acesso do usuário
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Verificar se o usuário tem acesso pago ou é admin
    if (!user.isPaid && !user.isAdmin) {
      toast.error('Você precisa ter acesso pago para ver os cursos. Entre em contato conosco.');
      router.push('/contact');
      return;
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h2>
          <p className="text-gray-600 mb-4">Você precisa estar logado para acessar esta página.</p>
          <button
            onClick={() => router.push('/login')}
            className="btn-primary"
          >
            Fazer Login
          </button>
        </div>
      </div>
    )
  }

  // Verificar se usuário tem acesso pago
  if (!user.isPaid && !user.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Restrito</h2>
          <p className="text-gray-600 mb-4">Você precisa ter acesso pago para ver os cursos.</p>
          <button
            onClick={() => router.push('/contact')}
            className="btn-primary"
          >
            Entrar em Contato
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando cursos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cursos</h1>
              <p className="text-gray-600">Escolha um curso para começar a estudar</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="btn-outline"
              >
                Dashboard
              </button>
              {selectedCourse && (
                <button
                  onClick={handleStartStudy}
                  className="btn-primary flex items-center gap-2"
                >
                  <PlayIcon className="w-5 h-5" />
                  Começar a Estudar
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedCourse ? (
          // Lista de Cursos
          <div>
            {courses.length === 0 ? (
              <div className="text-center py-12">
                <AcademicCapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum curso disponível</h3>
                <p className="text-gray-600 mb-4">
                  Você ainda não tem acesso a nenhum curso. Entre em contato com o administrador ou faça uma compra.
                </p>
                <button
                  onClick={() => router.push('/contact')}
                  className="btn-primary"
                >
                  Entrar em Contato
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="card hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleCourseSelect(course)}
                  >
                    <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                      <AcademicCapIcon className="w-16 h-16 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {course.name}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary-600">
                        R$ {course.price?.toFixed(2).replace('.', ',') || '0,00'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 text-sm font-medium">✓ Acesso Liberado</span>
                        <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Navegação do Curso
          <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-gray-500">
              <button
                onClick={() => setSelectedCourse(null)}
                className="hover:text-gray-700"
              >
                Cursos
              </button>
              <ChevronRightIcon className="w-4 h-4" />
              <span className="text-gray-900 font-medium">{selectedCourse.name}</span>
              {selectedSubject && (
                <>
                  <ChevronRightIcon className="w-4 h-4" />
                  <span className="text-gray-900 font-medium">{selectedSubject.name}</span>
                </>
              )}
              {selectedTopic && (
                <>
                  <ChevronRightIcon className="w-4 h-4" />
                  <span className="text-gray-900 font-medium">{selectedTopic.name}</span>
                </>
              )}
            </nav>

            {/* Conteúdo do Curso */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Matérias */}
              <div className="lg:col-span-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Matérias</h2>
                <div className="space-y-2">
                  {subjects.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Nenhuma matéria cadastrada ainda.</p>
                  ) : (
                    subjects.map((subject) => (
                      <div
                        key={subject.id}
                        className={`p-4 rounded-lg cursor-pointer transition-colors ${
                          selectedSubject?.id === subject.id
                            ? 'bg-primary-50 border border-primary-200'
                            : 'bg-white border border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => handleSubjectSelect(subject)}
                      >
                        <h3 className="font-medium text-gray-900">{subject.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{subject.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Tópicos */}
              {selectedSubject && (
                <div className="lg:col-span-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Tópicos</h2>
                  <div className="space-y-2">
                    {topics.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">Nenhum tópico cadastrado ainda.</p>
                    ) : (
                      topics.map((topic) => (
                        <div
                          key={topic.id}
                          className={`p-4 rounded-lg cursor-pointer transition-colors ${
                            selectedTopic?.id === topic.id
                              ? 'bg-primary-50 border border-primary-200'
                              : 'bg-white border border-gray-200 hover:bg-gray-50'
                          }`}
                          onClick={() => handleTopicSelect(topic)}
                        >
                          <h3 className="font-medium text-gray-900">{topic.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Sub-tópicos */}
              {selectedTopic && (
                <div className="lg:col-span-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Sub-tópicos</h2>
                  <div className="space-y-2">
                    {subTopics.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">Nenhum sub-tópico cadastrado ainda.</p>
                    ) : (
                      subTopics.map((subTopic) => (
                        <div
                          key={subTopic.id}
                          className="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={handleStartStudy}
                        >
                          <h3 className="font-medium text-gray-900">{subTopic.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{subTopic.description}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs text-gray-500">Flashcards disponíveis</span>
                            <PlayIcon className="w-4 h-4 text-primary-600" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Botão de Ação */}
            {selectedCourse && (
              <div className="flex justify-center pt-8">
                <button
                  onClick={handleStartStudy}
                  className="btn-primary text-lg px-8 py-3 flex items-center gap-2"
                >
                  <PlayIcon className="w-6 h-6" />
                  Começar a Estudar {selectedCourse.name}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 