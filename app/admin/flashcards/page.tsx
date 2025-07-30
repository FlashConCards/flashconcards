'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  DocumentTextIcon,
  ChevronLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { Flashcard } from '@/types'

export default function AdminFlashcardsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    {
      id: '1',
      subTopicId: '1',
      front: 'Qual é o princípio fundamental da República Federativa do Brasil?',
      back: 'A soberania popular, expressa pelo voto direto, secreto, universal e periódico.',
      explanation: 'A soberania popular é o fundamento da democracia brasileira, garantindo que o poder emana do povo.',
      isActive: true,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      subTopicId: '1',
      front: 'Quais são os poderes da União?',
      back: 'Legislativo, Executivo e Judiciário, independentes e harmônicos entre si.',
      explanation: 'A separação dos poderes é um princípio fundamental da democracia, garantindo o controle mútuo entre os poderes.',
      isActive: true,
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      subTopicId: '1',
      front: 'O que é o habeas corpus?',
      back: 'Remédio constitucional que protege a liberdade de locomoção quando ameaçada ou restringida por ilegalidade ou abuso de poder.',
      explanation: 'O habeas corpus é uma garantia fundamental que protege a liberdade individual contra abusos do poder público.',
      isActive: false,
      order: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ])

  const [showModal, setShowModal] = useState(false)
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [filterStatus, setFilterStatus] = useState('all')

  const handleAddFlashcard = () => {
    setEditingFlashcard(null)
    setShowModal(true)
  }

  const handleEditFlashcard = (flashcard: Flashcard) => {
    setEditingFlashcard(flashcard)
    setShowModal(true)
  }

  const handleToggleStatus = (flashcardId: string) => {
    setFlashcards(prev => prev.map(flashcard => 
      flashcard.id === flashcardId 
        ? { ...flashcard, isActive: !flashcard.isActive }
        : flashcard
    ))
  }

  const handleDeleteFlashcard = (flashcardId: string) => {
    if (confirm('Tem certeza que deseja excluir este flashcard?')) {
      setFlashcards(prev => prev.filter(flashcard => flashcard.id !== flashcardId))
    }
  }

  const filteredFlashcards = flashcards.filter(flashcard => {
    const matchesSearch = flashcard.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         flashcard.back.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && flashcard.isActive) ||
                         (filterStatus === 'inactive' && !flashcard.isActive)
    
    return matchesSearch && matchesStatus
  })

  const isAdmin = user?.isAdmin || user?.email === 'admin@flashconcards.com' || user?.email === 'demo@flashconcards.com'
  
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h2>
          <p className="text-gray-600 mb-4">Você não tem permissão para acessar esta página.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="btn-primary"
          >
            Voltar ao Dashboard
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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin')}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gerenciar Flashcards</h1>
                <p className="text-gray-600">Adicione, edite ou remova flashcards da plataforma</p>
              </div>
            </div>
            <button
              onClick={handleAddFlashcard}
              className="btn-primary flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Adicionar Flashcard
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DocumentTextIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Flashcards</p>
                <p className="text-2xl font-bold text-gray-900">{flashcards.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <EyeIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {flashcards.filter(f => f.isActive).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <EyeSlashIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inativos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {flashcards.filter(f => !f.isActive).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DocumentTextIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Matérias</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar flashcards..."
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field"
              >
                <option value="all">Todos</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Flashcards List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Flashcards ({filteredFlashcards.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pergunta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resposta
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFlashcards.map((flashcard) => (
                  <tr key={flashcard.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {flashcard.front}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {flashcard.back}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        flashcard.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {flashcard.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditFlashcard(flashcard)}
                          className="text-primary-600 hover:text-primary-900 p-1 rounded"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(flashcard.id)}
                          className={`p-1 rounded ${
                            flashcard.isActive
                              ? 'text-yellow-600 hover:text-yellow-900'
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {flashcard.isActive ? (
                            <EyeSlashIcon className="w-4 h-4" />
                          ) : (
                            <EyeIcon className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteFlashcard(flashcard.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingFlashcard ? 'Editar Flashcard' : 'Adicionar Flashcard'}
              </h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pergunta/Frente
                  </label>
                  <textarea
                    defaultValue={editingFlashcard?.front || ''}
                    className="input-field"
                    rows={3}
                    placeholder="Digite a pergunta ou conteúdo da frente do card..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resposta/Verso
                  </label>
                  <textarea
                    defaultValue={editingFlashcard?.back || ''}
                    className="input-field"
                    rows={3}
                    placeholder="Digite a resposta ou conteúdo do verso do card..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Explicação (Opcional)
                  </label>
                  <textarea
                    defaultValue={editingFlashcard?.explanation || ''}
                    className="input-field"
                    rows={3}
                    placeholder="Explicação detalhada do conteúdo..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sub-tópico
                  </label>
                  <select
                    defaultValue={editingFlashcard?.subTopicId || '1'}
                    className="input-field"
                  >
                    <option value="1">Soberania Popular</option>
                    <option value="2">Separação de Poderes</option>
                    <option value="3">Habeas Corpus</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked={editingFlashcard?.isActive ?? true}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Flashcard Ativo
                  </label>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-outline"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    {editingFlashcard ? 'Salvar' : 'Adicionar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 