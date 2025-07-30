'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { 
  BookOpenIcon, 
  AcademicCapIcon,
  ChevronRightIcon,
  PlayIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'
import { Course, Subject, Topic, SubTopic } from '@/types'

// Dados mockados para demonstração
const mockCourses: Course[] = [
  {
    id: 'inss',
    name: 'INSS - Instituto Nacional do Seguro Social',
    description: 'Preparação completa para o concurso do INSS com foco em Direito Previdenciário, Administrativo e Constitucional.',
    image: 'https://via.placeholder.com/400x200/3B82F6/FFFFFF?text=INSS',
    price: 99.90,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'tj',
    name: 'TJ - Tribunal de Justiça',
    description: 'Concurso para cargos de técnico e analista judiciário com matérias específicas do Direito.',
    image: 'https://via.placeholder.com/400x200/10B981/FFFFFF?text=TJ',
    price: 99.90,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'pm',
    name: 'PM - Polícia Militar',
    description: 'Preparação para concursos de soldado e oficial da Polícia Militar com foco em Direito Penal e Constitucional.',
    image: 'https://via.placeholder.com/400x200/F59E0B/FFFFFF?text=PM',
    price: 99.90,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const mockSubjects: Subject[] = [
  { id: '1', courseId: 'inss', name: 'Direito Constitucional', description: 'Princípios fundamentais e direitos constitucionais', order: 1, isActive: true },
  { id: '2', courseId: 'inss', name: 'Direito Administrativo', description: 'Atos administrativos e princípios da administração', order: 2, isActive: true },
  { id: '3', courseId: 'inss', name: 'Direito Previdenciário', description: 'Sistema previdenciário e benefícios', order: 3, isActive: true },
]

const mockTopics: Topic[] = [
  { id: '1', subjectId: '1', name: 'Princípios Fundamentais', description: 'Fundamentos da República', order: 1, isActive: true },
  { id: '2', subjectId: '1', name: 'Direitos e Garantias', description: 'Direitos fundamentais', order: 2, isActive: true },
  { id: '3', subjectId: '2', name: 'Atos Administrativos', description: 'Classificação e elementos', order: 1, isActive: true },
]

const mockSubTopics: SubTopic[] = [
  { id: '1', topicId: '1', name: 'Soberania Popular', description: 'Princípio da soberania popular', order: 1, isActive: true },
  { id: '2', topicId: '1', name: 'Separação de Poderes', description: 'Poderes da União', order: 2, isActive: true },
  { id: '3', topicId: '2', name: 'Habeas Corpus', description: 'Remédios constitucionais', order: 1, isActive: true },
  { id: '4', topicId: '3', name: 'Princípio da Legalidade', description: 'Legalidade na administração', order: 1, isActive: true },
]

export default function CoursesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course)
    setSelectedSubject(null)
    setSelectedTopic(null)
  }

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject)
    setSelectedTopic(null)
  }

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic)
  }

  const handleStartStudy = () => {
    router.push('/study')
  }

  const getSubjectsForCourse = (courseId: string) => {
    return mockSubjects.filter(subject => subject.courseId === courseId)
  }

  const getTopicsForSubject = (subjectId: string) => {
    return mockTopics.filter(topic => topic.subjectId === subjectId)
  }

  const getSubTopicsForTopic = (topicId: string) => {
    return mockSubTopics.filter(subTopic => subTopic.topicId === topicId)
  }

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockCourses.map((course) => (
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
                    R$ {course.price.toFixed(2).replace('.', ',')}
                  </span>
                  <div className="flex items-center gap-2">
                    {user.isPaid ? (
                      <span className="text-green-600 text-sm font-medium">✓ Acesso Liberado</span>
                    ) : (
                      <span className="text-red-600 text-sm font-medium flex items-center gap-1">
                        <LockClosedIcon className="w-4 h-4" />
                        Bloqueado
                      </span>
                    )}
                    <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
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
                  {getSubjectsForCourse(selectedCourse.id).map((subject) => (
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
                  ))}
                </div>
              </div>

              {/* Tópicos */}
              {selectedSubject && (
                <div className="lg:col-span-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Tópicos</h2>
                  <div className="space-y-2">
                    {getTopicsForSubject(selectedSubject.id).map((topic) => (
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
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-tópicos */}
              {selectedTopic && (
                <div className="lg:col-span-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Sub-tópicos</h2>
                  <div className="space-y-2">
                    {getSubTopicsForTopic(selectedTopic.id).map((subTopic) => (
                      <div
                        key={subTopic.id}
                        className="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={handleStartStudy}
                      >
                        <h3 className="font-medium text-gray-900">{subTopic.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{subTopic.description}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-gray-500">5 flashcards</span>
                          <PlayIcon className="w-4 h-4 text-primary-600" />
                        </div>
                      </div>
                    ))}
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