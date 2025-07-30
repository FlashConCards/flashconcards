'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import {
  PlusIcon, PencilIcon, TrashIcon,
  BookOpenIcon, AcademicCapIcon, ChevronRightIcon, ArrowLeftIcon,
  FolderIcon, DocumentTextIcon, PhotoIcon, CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { Course, Subject, Topic, SubTopic, Flashcard, Deepening } from '@/types'
import { 
  getCourses, 
  getSubjects, 
  getTopics, 
  getSubTopics, 
  getFlashcards, 
  getDeepenings,
  createCourse,
  deleteCourse,
  onCoursesChange
} from '@/lib/firebase'

export default function AdminCoursesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [selectedSubTopic, setSelectedSubTopic] = useState<SubTopic | null>(null)
  const [activeView, setActiveView] = useState<'courses' | 'subjects' | 'topics' | 'subtopics' | 'content'>('courses')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  
  // Estados para dados do Firebase
  const [courses, setCourses] = useState<Course[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [subTopics, setSubTopics] = useState<SubTopic[]>([])
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [deepenings, setDeepenings] = useState<Deepening[]>([])
  
  // Estados para modais
  const [showAddCourseModal, setShowAddCourseModal] = useState(false)
  const [showDeleteCourseModal, setShowDeleteCourseModal] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null)
  
  // Estados para novo curso
  const [newCourse, setNewCourse] = useState({
    name: '',
    description: '',
    price: 99.90,
    image: '/api/placeholder/400/200'
  })

  // Verificar se é admin
  const isAdmin = user?.email === 'claudioghabryel.cg@gmail.com' || user?.email === 'natalhia775@gmail.com'
  
  // Carregar dados do Firebase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Carregar cursos
        const coursesData = await getCourses()
        setCourses(coursesData)
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isAdmin) {
      loadData()
    }
  }, [isAdmin])

  // Listener em tempo real para cursos
  useEffect(() => {
    if (!isAdmin) return

    const unsubscribe = onCoursesChange((data) => {
      setCourses(data)
    })

    return () => unsubscribe()
  }, [isAdmin])

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
          <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    )
  }

  const getSubjectsForCourse = async (courseId: string) => {
    try {
      const subjectsData = await getSubjects(courseId)
      setSubjects(subjectsData)
      return subjectsData
    } catch (error) {
      console.error('Erro ao carregar matérias:', error)
      return []
    }
  }

  const getTopicsForSubject = async (subjectId: string) => {
    if (!selectedCourse) return []
    try {
      const topicsData = await getTopics(selectedCourse.id, subjectId)
      setTopics(topicsData)
      return topicsData
    } catch (error) {
      console.error('Erro ao carregar tópicos:', error)
      return []
    }
  }

  const getSubTopicsForTopic = async (topicId: string) => {
    if (!selectedCourse || !selectedSubject) return []
    try {
      const subTopicsData = await getSubTopics(selectedCourse.id, selectedSubject.id, topicId)
      setSubTopics(subTopicsData)
      return subTopicsData
    } catch (error) {
      console.error('Erro ao carregar sub-tópicos:', error)
      return []
    }
  }

  const getFlashcardsForSubTopic = async (subTopicId: string) => {
    if (!selectedCourse || !selectedSubject || !selectedTopic) return []
    try {
      const flashcardsData = await getFlashcards(selectedCourse.id, selectedSubject.id, selectedTopic.id, subTopicId)
      setFlashcards(flashcardsData)
      return flashcardsData
    } catch (error) {
      console.error('Erro ao carregar flashcards:', error)
      return []
    }
  }

  const getDeepeningsForFlashcard = async (flashcardId: string) => {
    if (!selectedCourse || !selectedSubject || !selectedTopic || !selectedSubTopic) return []
    try {
      const deepeningsData = await getDeepenings(selectedCourse.id, selectedSubject.id, selectedTopic.id, selectedSubTopic.id)
      setDeepenings(deepeningsData)
      return deepeningsData
    } catch (error) {
      console.error('Erro ao carregar aprofundamentos:', error)
      return []
    }
  }

  const handleCourseSelect = async (course: Course) => {
    setSelectedCourse(course)
    setSelectedSubject(null)
    setSelectedTopic(null)
    setSelectedSubTopic(null)
    setActiveView('subjects')
    await getSubjectsForCourse(course.id)
  }

  const handleSubjectSelect = async (subject: Subject) => {
    setSelectedSubject(subject)
    setSelectedTopic(null)
    setSelectedSubTopic(null)
    setActiveView('topics')
    await getTopicsForSubject(subject.id)
  }

  const handleTopicSelect = async (topic: Topic) => {
    setSelectedTopic(topic)
    setSelectedSubTopic(null)
    setActiveView('subtopics')
    await getSubTopicsForTopic(topic.id)
  }

  const handleSubTopicSelect = async (subTopic: SubTopic) => {
    setSelectedSubTopic(subTopic)
    setActiveView('content')
    await getFlashcardsForSubTopic(subTopic.id)
  }

  const handleAddCourse = () => {
    setShowAddCourseModal(true)
  }

  const handleSaveCourse = async () => {
    try {
      if (!newCourse.name || !newCourse.description) {
        alert('Por favor, preencha todos os campos obrigatórios.')
        return
      }

      const courseData = {
        name: newCourse.name,
        description: newCourse.description,
        price: newCourse.price,
        image: newCourse.image,
        isActive: true
      }

      await createCourse(courseData)
      setShowAddCourseModal(false)
      setNewCourse({ name: '', description: '', price: 99.90, image: '/api/placeholder/400/200' })
      alert('Curso adicionado com sucesso!')
    } catch (error) {
      console.error('Erro ao adicionar curso:', error)
      alert('Erro ao adicionar curso. Tente novamente.')
    }
  }

  const handleDeleteCourse = (course: Course) => {
    setCourseToDelete(course)
    setShowDeleteCourseModal(true)
  }

  const confirmDeleteCourse = async () => {
    try {
      if (!courseToDelete) return
      
      await deleteCourse(courseToDelete.id)
      setShowDeleteCourseModal(false)
      setCourseToDelete(null)
      alert('Curso excluído com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir curso:', error)
      alert('Erro ao excluir curso. Tente novamente.')
    }
  }

  const renderBreadcrumb = () => (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
      <button
        onClick={() => {
          setActiveView('courses')
          setSelectedCourse(null)
          setSelectedSubject(null)
          setSelectedTopic(null)
          setSelectedSubTopic(null)
        }}
        className="hover:text-gray-700"
      >
        Cursos
      </button>
      {selectedCourse && (
        <>
          <ChevronRightIcon className="w-4 h-4" />
          <button
            onClick={() => {
              setActiveView('subjects')
              setSelectedSubject(null)
              setSelectedTopic(null)
              setSelectedSubTopic(null)
            }}
            className="hover:text-gray-700"
          >
            {selectedCourse.name}
          </button>
        </>
      )}
      {selectedSubject && (
        <>
          <ChevronRightIcon className="w-4 h-4" />
          <button
            onClick={() => {
              setActiveView('topics')
              setSelectedTopic(null)
              setSelectedSubTopic(null)
            }}
            className="hover:text-gray-700"
          >
            {selectedSubject.name}
          </button>
        </>
      )}
      {selectedTopic && (
        <>
          <ChevronRightIcon className="w-4 h-4" />
          <button
            onClick={() => {
              setActiveView('subtopics')
              setSelectedSubTopic(null)
            }}
            className="hover:text-gray-700"
          >
            {selectedTopic.name}
          </button>
        </>
      )}
      {selectedSubTopic && (
        <>
          <ChevronRightIcon className="w-4 h-4" />
          <span>{selectedSubTopic.name}</span>
        </>
      )}
    </nav>
  )

  const renderCourses = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Cursos</h2>
        <button
          onClick={handleAddCourse}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Adicionar Curso
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum curso encontrado</h3>
          <p className="text-gray-600">Adicione seu primeiro curso para começar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="relative">
                <img
                  src={course.image}
                  alt={course.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    course.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {course.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{course.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-primary-600">
                    R$ {course.price.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-sm text-gray-500">
                    {subjects.filter(s => s.courseId === course.id).length} matérias
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleCourseSelect(course)}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <BookOpenIcon className="w-4 h-4" />
                    Gerenciar
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course)}
                    className="btn-outline text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderSubjects = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Matérias - {selectedCourse?.name}</h2>
        <button className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Adicionar Matéria
        </button>
      </div>

      {subjects.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <AcademicCapIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma matéria encontrada</h3>
          <p className="text-gray-600">Adicione matérias ao curso para organizar o conteúdo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <div key={subject.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{subject.name}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  subject.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {subject.isActive ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleSubjectSelect(subject)}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <AcademicCapIcon className="w-4 h-4" />
                  Ver Tópicos
                </button>
                <button className="btn-outline text-red-600 hover:text-red-700 border-red-200 hover:border-red-300">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderTopics = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Tópicos - {selectedSubject?.name}</h2>
        <button className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Adicionar Tópico
        </button>
      </div>

      {topics.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <FolderIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum tópico encontrado</h3>
          <p className="text-gray-600">Adicione tópicos à matéria para organizar o conteúdo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <div key={topic.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{topic.name}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  topic.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {topic.isActive ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleTopicSelect(topic)}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <FolderIcon className="w-4 h-4" />
                  Ver Sub-tópicos
                </button>
                <button className="btn-outline text-red-600 hover:text-red-700 border-red-200 hover:border-red-300">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderSubTopics = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Sub-tópicos - {selectedTopic?.name}</h2>
        <button className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Adicionar Sub-tópico
        </button>
      </div>

      {subTopics.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum sub-tópico encontrado</h3>
          <p className="text-gray-600">Adicione sub-tópicos para organizar o conteúdo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subTopics.map((subTopic) => (
            <div key={subTopic.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{subTopic.name}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  subTopic.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {subTopic.isActive ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleSubTopicSelect(subTopic)}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <DocumentTextIcon className="w-4 h-4" />
                  Ver Conteúdo
                </button>
                <button className="btn-outline text-red-600 hover:text-red-700 border-red-200 hover:border-red-300">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Conteúdo - {selectedSubTopic?.name}</h2>
        <div className="flex space-x-2">
          <button className="btn-primary flex items-center gap-2">
            <PlusIcon className="w-5 h-5" />
            Adicionar Flashcard
          </button>
          <button className="btn-outline flex items-center gap-2">
            <PlusIcon className="w-5 h-5" />
            Adicionar Aprofundamento
          </button>
        </div>
      </div>

      {/* Flashcards */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Flashcards</h3>
        {flashcards.length === 0 ? (
          <p className="text-gray-600 text-center py-8">Nenhum flashcard encontrado.</p>
        ) : (
          <div className="space-y-4">
            {flashcards.map((flashcard) => (
              <div key={flashcard.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">Frente: {flashcard.front}</h4>
                    <p className="text-sm text-gray-600">Verso: {flashcard.back}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Ordem: {flashcard.order}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    flashcard.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {flashcard.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Aprofundamentos */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Aprofundamentos</h3>
        {deepenings.length === 0 ? (
          <p className="text-gray-600 text-center py-8">Nenhum aprofundamento encontrado.</p>
        ) : (
          <div className="space-y-4">
            {deepenings.map((deepening) => (
              <div key={deepening.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{deepening.title}</h4>
                    <p className="text-sm text-gray-600">Flashcard relacionado</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{deepening.images.length} imagem, {deepening.videos.length} vídeo, {deepening.pdfs.length} PDF</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    deepening.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {deepening.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin')}
                className="btn-outline flex items-center gap-2"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Voltar
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gerenciar Cursos</h1>
                <p className="text-gray-600">Organize o conteúdo por curso, matéria, tópico e sub-tópico</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderBreadcrumb()}
        {activeView === 'courses' && renderCourses()}
        {activeView === 'subjects' && renderSubjects()}
        {activeView === 'topics' && renderTopics()}
        {activeView === 'subtopics' && renderSubTopics()}
        {activeView === 'content' && renderContent()}
      </div>

      {/* Modal Adicionar Curso */}
      {showAddCourseModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Adicionar Novo Curso</h3>
              <button
                onClick={() => setShowAddCourseModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Curso
                </label>
                <input
                  type="text"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                  className="input-field"
                  placeholder="Ex: INSS - Instituto Nacional do Seguro Social"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                  className="input-field"
                  rows={3}
                  placeholder="Descreva o curso..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço (R$)
                  </label>
                  <div className="relative">
                    <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={newCourse.price}
                      onChange={(e) => setNewCourse({...newCourse, price: parseFloat(e.target.value)})}
                      className="input-field pl-10"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagem do Curso
                  </label>
                  <div className="flex items-center space-x-2">
                    <PhotoIcon className="w-5 h-5 text-gray-400" />
                    <input
                      type="file"
                      accept="image/*"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddCourseModal(false)}
                className="btn-outline"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCourse}
                className="btn-primary"
              >
                Adicionar Curso
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Deletar Curso */}
      {showDeleteCourseModal && courseToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar Exclusão</h3>
              <p className="text-gray-600 mb-6">
                Tem certeza que deseja excluir o curso <strong>"{courseToDelete.name}"</strong>?
                Esta ação não pode ser desfeita.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowDeleteCourseModal(false)}
                  className="btn-outline"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteCourse}
                  className="btn-primary bg-red-600 hover:bg-red-700"
                >
                  Excluir Curso
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 