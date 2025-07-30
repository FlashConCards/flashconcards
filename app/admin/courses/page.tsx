'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import {
  PlusIcon, PencilIcon, TrashIcon,
  BookOpenIcon, AcademicCapIcon, ChevronRightIcon, ArrowLeftIcon,
  FolderIcon, DocumentTextIcon, PhotoIcon, CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { Course, Subject, Topic, SubTopic, Flashcard, Deepening } from '@/types'

// Mock data
const mockCourses: Course[] = [
  {
    id: 'inss',
    name: 'INSS - Instituto Nacional do Seguro Social',
    description: 'Preparação completa para o concurso do INSS',
    image: '/api/placeholder/400/200',
    price: 99.90,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'tj',
    name: 'TJ - Tribunal de Justiça',
    description: 'Concurso para cargos de técnico e analista judiciário',
    image: '/api/placeholder/400/200',
    price: 99.90,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'pm',
    name: 'PM - Polícia Militar',
    description: 'Preparação para concursos de soldado e oficial da PM',
    image: '/api/placeholder/400/200',
    price: 99.90,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

const mockSubjects: Subject[] = [
  { id: 'sub1', courseId: 'inss', name: 'Direito Previdenciário', description: 'Matéria sobre direito previdenciário', order: 1, isActive: true },
  { id: 'sub2', courseId: 'inss', name: 'Direito Administrativo', description: 'Matéria sobre direito administrativo', order: 2, isActive: true },
  { id: 'sub3', courseId: 'tj', name: 'Direito Civil', description: 'Matéria sobre direito civil', order: 1, isActive: true },
  { id: 'sub4', courseId: 'pm', name: 'Direito Penal', description: 'Matéria sobre direito penal', order: 1, isActive: true }
]

const mockTopics: Topic[] = [
  { id: 'top1', subjectId: 'sub1', name: 'Benefícios Previdenciários', description: 'Tópico sobre benefícios', order: 1, isActive: true },
  { id: 'top2', subjectId: 'sub1', name: 'Contribuições', description: 'Tópico sobre contribuições', order: 2, isActive: true },
  { id: 'top3', subjectId: 'sub3', name: 'Contratos', description: 'Tópico sobre contratos', order: 1, isActive: true }
]

const mockSubTopics: SubTopic[] = [
  { id: 'st1', topicId: 'top1', name: 'Aposentadoria por Idade', description: 'Sub-tópico sobre aposentadoria', order: 1, isActive: true },
  { id: 'st2', topicId: 'top1', name: 'Aposentadoria por Tempo de Contribuição', description: 'Sub-tópico sobre aposentadoria', order: 2, isActive: true },
  { id: 'st3', topicId: 'top3', name: 'Contrato de Compra e Venda', description: 'Sub-tópico sobre contratos', order: 1, isActive: true }
]

const mockFlashcards: Flashcard[] = [
  { id: 'fc1', subTopicId: 'st1', front: 'O que é aposentadoria por idade?', back: 'Benefício concedido ao segurado que completar 65 anos (homem) ou 60 anos (mulher)', explanation: 'Aposentadoria por idade é um benefício previdenciário', isActive: true, order: 1, createdAt: new Date(), updatedAt: new Date() },
  { id: 'fc2', subTopicId: 'st1', front: 'Qual a idade mínima para aposentadoria por idade?', back: '65 anos para homens e 60 anos para mulheres', explanation: 'Idade mínima estabelecida pela legislação', isActive: true, order: 2, createdAt: new Date(), updatedAt: new Date() }
]

const mockDeepenings: Deepening[] = [
  { id: 'dep1', flashcardId: 'fc1', title: 'Aposentadoria por Idade - Detalhes', content: '<p><strong>Aposentadoria por Idade</strong> é um benefício previdenciário...</p>', images: [], videos: [], pdfs: [], externalLinks: [], isActive: true }
]

export default function AdminCoursesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [selectedSubTopic, setSelectedSubTopic] = useState<SubTopic | null>(null)
  const [activeView, setActiveView] = useState<'courses' | 'subjects' | 'topics' | 'subtopics' | 'content'>('courses')
  const [searchTerm, setSearchTerm] = useState('')
  
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

  const getSubjectsForCourse = (courseId: string) => {
    return mockSubjects.filter(subject => subject.courseId === courseId)
  }

  const getTopicsForSubject = (subjectId: string) => {
    return mockTopics.filter(topic => topic.subjectId === subjectId)
  }

  const getSubTopicsForTopic = (topicId: string) => {
    return mockSubTopics.filter(subTopic => subTopic.topicId === topicId)
  }

  const getFlashcardsForSubTopic = (subTopicId: string) => {
    return mockFlashcards.filter(flashcard => flashcard.subTopicId === subTopicId)
  }

  const getDeepeningsForFlashcard = (flashcardId: string) => {
    return mockDeepenings.filter(deepening => deepening.flashcardId === flashcardId)
  }

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course)
    setSelectedSubject(null)
    setSelectedTopic(null)
    setSelectedSubTopic(null)
    setActiveView('subjects')
  }

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject)
    setSelectedTopic(null)
    setSelectedSubTopic(null)
    setActiveView('topics')
  }

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic)
    setSelectedSubTopic(null)
    setActiveView('subtopics')
  }

  const handleSubTopicSelect = (subTopic: SubTopic) => {
    setSelectedSubTopic(subTopic)
    setActiveView('content')
  }

  const handleAddCourse = () => {
    setShowAddCourseModal(true)
  }

  const handleSaveCourse = () => {
    // Aqui você implementaria a lógica para salvar o curso
    console.log('Salvando curso:', newCourse)
    setShowAddCourseModal(false)
    setNewCourse({ name: '', description: '', price: 99.90, image: '/api/placeholder/400/200' })
  }

  const handleDeleteCourse = (course: Course) => {
    setCourseToDelete(course)
    setShowDeleteCourseModal(true)
  }

  const confirmDeleteCourse = () => {
    // Aqui você implementaria a lógica para deletar o curso
    console.log('Deletando curso:', courseToDelete)
    setShowDeleteCourseModal(false)
    setCourseToDelete(null)
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCourses.map((course) => (
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
                  {getSubjectsForCourse(course.id).length} matérias
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getSubjectsForCourse(selectedCourse!.id).map((subject) => (
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getTopicsForSubject(selectedSubject!.id).map((topic) => (
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getSubTopicsForTopic(selectedTopic!.id).map((subTopic) => (
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
        <div className="space-y-4">
          {getFlashcardsForSubTopic(selectedSubTopic!.id).map((flashcard) => (
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
      </div>

      {/* Aprofundamentos */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Aprofundamentos</h3>
        <div className="space-y-4">
          {getFlashcardsForSubTopic(selectedSubTopic!.id).map((flashcard) =>
            getDeepeningsForFlashcard(flashcard.id).map((deepening) => (
              <div key={deepening.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{deepening.title}</h4>
                    <p className="text-sm text-gray-600">Flashcard: {flashcard.front}</p>
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
            ))
          )}
        </div>
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