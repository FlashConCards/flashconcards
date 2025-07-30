'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import {
  ChartBarIcon,
  UserGroupIcon,
  BookOpenIcon,
  CogIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  StarIcon
} from '@heroicons/react/24/outline'

// Mock data
const mockUsers = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@example.com',
    isPaid: true,
    isAdmin: false,
    isActive: true,
    lastLoginAt: new Date('2024-01-15'),
    studyTime: 120,
    cardsStudied: 45,
    cardsCorrect: 38,
    cardsWrong: 7
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@example.com',
    isPaid: false,
    isAdmin: false,
    isActive: true,
    lastLoginAt: new Date('2024-01-14'),
    studyTime: 0,
    cardsStudied: 0,
    cardsCorrect: 0,
    cardsWrong: 0
  }
]

const mockTestimonials = [
  {
    id: '1',
    name: 'Maria Silva',
    email: 'maria@example.com',
    role: 'Aprovada no INSS',
    content: 'Os flashcards me ajudaram muito! Consegui memorizar todo o conteúdo de forma eficiente.',
    rating: 5,
    course: 'INSS',
    createdAt: new Date('2024-01-15'),
    isApproved: true
  },
  {
    id: '2',
    name: 'João Santos',
    email: 'joao@example.com',
    role: 'Aprovado no TJ',
    content: 'A plataforma é incrível! O sistema de repetição espaçada fez toda a diferença.',
    rating: 5,
    course: 'TJ',
    createdAt: new Date('2024-01-14'),
    isApproved: true
  },
  {
    id: '3',
    name: 'Ana Costa',
    email: 'ana@example.com',
    role: 'Aprovada na PM',
    content: 'Conteúdo de qualidade e interface intuitiva. Recomendo para todos!',
    rating: 5,
    course: 'PM',
    createdAt: new Date('2024-01-13'),
    isApproved: true
  },
  {
    id: '4',
    name: 'Pedro Lima',
    email: 'pedro@example.com',
    role: 'Aprovado no INSS',
    content: 'Excelente plataforma! Os flashcards são muito eficientes para memorização.',
    rating: 4,
    course: 'INSS',
    createdAt: new Date('2024-01-12'),
    isApproved: false // Aguardando aprovação
  },
  {
    id: '5',
    name: 'Carla Souza',
    email: 'carla@example.com',
    role: 'Aprovada no TJ',
    content: 'Muito bom o conteúdo! Recomendo fortemente para quem está estudando.',
    rating: 5,
    course: 'TJ',
    createdAt: new Date('2024-01-11'),
    isApproved: false // Aguardando aprovação
  }
]

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [users, setUsers] = useState(mockUsers)
  const [testimonials, setTestimonials] = useState(mockTestimonials)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    isPaid: false,
    isAdmin: false
  })

  if (!user || !user.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h2>
          <p className="text-gray-600 mb-4">Você não tem permissão para acessar esta página.</p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    )
  }

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert('Por favor, preencha todos os campos.')
      return
    }

    const user = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      isPaid: newUser.isPaid,
      isAdmin: newUser.isAdmin,
      isActive: true,
      lastLoginAt: new Date(),
      studyTime: 0,
      cardsStudied: 0,
      cardsCorrect: 0,
      cardsWrong: 0
    }

    setUsers([...users, user])
    setNewUser({ name: '', email: '', password: '', isPaid: false, isAdmin: false })
    setShowAddUserModal(false)
    alert('Usuário adicionado com sucesso!')
  }

  const handleApproveTestimonial = (testimonialId: string) => {
    setTestimonials(testimonials.map(t => 
      t.id === testimonialId ? { ...t, isApproved: true } : t
    ))
    alert('Depoimento aprovado com sucesso!')
  }

  const handleRejectTestimonial = (testimonialId: string) => {
    setTestimonials(testimonials.filter(t => t.id !== testimonialId))
    alert('Depoimento rejeitado e removido!')
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  const pendingTestimonials = testimonials.filter(t => !t.isApproved)
  const approvedTestimonials = testimonials.filter(t => t.isApproved)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
              <p className="text-gray-600">Bem-vindo, {user.displayName || user.email}</p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="btn-outline"
            >
              Voltar ao Site
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ChartBarIcon className="w-5 h-5 inline mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <UserGroupIcon className="w-5 h-5 inline mr-2" />
              Usuários
            </button>
            <button
              onClick={() => setActiveTab('testimonials')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'testimonials'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5 inline mr-2" />
              Depoimentos
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'courses'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BookOpenIcon className="w-5 h-5 inline mr-2" />
              Cursos
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <CogIcon className="w-5 h-5 inline mr-2" />
              Configurações
            </button>
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <UserGroupIcon className="w-8 h-8 text-primary-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                    <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <CheckIcon className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Usuários Pagantes</p>
                    <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.isPaid).length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <ChatBubbleLeftRightIcon className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Depoimentos</p>
                    <p className="text-2xl font-bold text-gray-900">{testimonials.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <EyeIcon className="w-8 h-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Aguardando Aprovação</p>
                    <p className="text-2xl font-bold text-gray-900">{pendingTestimonials.length}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Novos depoimentos aguardando aprovação</p>
                    <p className="text-sm text-gray-600">{pendingTestimonials.length} depoimentos</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('testimonials')}
                    className="btn-primary"
                  >
                    Ver Depoimentos
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Gerenciar Usuários</h2>
              <button
                onClick={() => setShowAddUserModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                Adicionar Usuário
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Último Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progresso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {user.isPaid ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Pagante
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Não Pagante
                            </span>
                          )}
                          {user.isAdmin && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Admin
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastLoginAt.toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.cardsStudied} flashcards estudados
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.studyTime} min de estudo
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-primary-600 hover:text-primary-900 mr-3">
                          Editar
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Testimonials Tab */}
        {activeTab === 'testimonials' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Gerenciar Depoimentos</h2>
              <div className="flex space-x-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  {pendingTestimonials.length} aguardando aprovação
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {approvedTestimonials.length} aprovados
                </span>
              </div>
            </div>

            {/* Pending Testimonials */}
            {pendingTestimonials.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Aguardando Aprovação</h3>
                <div className="space-y-4">
                  {pendingTestimonials.map((testimonial) => (
                    <div key={testimonial.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                            <span className="text-sm text-gray-500">({testimonial.email})</span>
                            <span className="text-sm text-primary-600">{testimonial.role}</span>
                          </div>
                          <div className="flex items-center mb-2">
                            {renderStars(testimonial.rating)}
                            <span className="ml-2 text-sm text-gray-600">({testimonial.rating}/5)</span>
                          </div>
                          <p className="text-gray-700 italic mb-2">"{testimonial.content}"</p>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>Curso: {testimonial.course}</span>
                            <span>{testimonial.createdAt.toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleApproveTestimonial(testimonial.id)}
                            className="btn-primary flex items-center gap-1"
                          >
                            <CheckIcon className="w-4 h-4" />
                            Aprovar
                          </button>
                          <button
                            onClick={() => handleRejectTestimonial(testimonial.id)}
                            className="btn-outline text-red-600 border-red-300 hover:bg-red-50 flex items-center gap-1"
                          >
                            <XMarkIcon className="w-4 h-4" />
                            Rejeitar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Approved Testimonials */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Depoimentos Aprovados</h3>
              <div className="space-y-4">
                {approvedTestimonials.map((testimonial) => (
                  <div key={testimonial.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                          <span className="text-sm text-gray-500">({testimonial.email})</span>
                          <span className="text-sm text-primary-600">{testimonial.role}</span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Aprovado
                          </span>
                        </div>
                        <div className="flex items-center mb-2">
                          {renderStars(testimonial.rating)}
                          <span className="ml-2 text-sm text-gray-600">({testimonial.rating}/5)</span>
                        </div>
                        <p className="text-gray-700 italic mb-2">"{testimonial.content}"</p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Curso: {testimonial.course}</span>
                          <span>{testimonial.createdAt.toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleRejectTestimonial(testimonial.id)}
                          className="btn-outline text-red-600 border-red-300 hover:bg-red-50 flex items-center gap-1"
                        >
                          <TrashIcon className="w-4 h-4" />
                          Remover
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Gerenciar Cursos</h2>
              <button
                onClick={() => router.push('/admin/courses')}
                className="btn-primary flex items-center gap-2"
              >
                <BookOpenIcon className="w-5 h-5" />
                Gerenciar Cursos
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-gray-600">Clique no botão acima para gerenciar cursos, matérias, tópicos e flashcards.</p>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Configurações</h2>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Segurança</h3>
                  <p className="text-gray-600">Configurações de segurança e autenticação.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Notificações</h3>
                  <p className="text-gray-600">Configurações de notificações e alertas.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Configurações Gerais</h3>
                  <p className="text-gray-600">Configurações gerais da plataforma.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Configurações para Pagamento</h3>
                  <p className="text-gray-600">Configurações do Mercado Pago e pagamentos.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Adicionar Usuário</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    className="input-field"
                    placeholder="Nome do usuário"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="input-field"
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha Temporária
                  </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="input-field"
                    placeholder="Senha temporária"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newUser.isPaid}
                      onChange={(e) => setNewUser({...newUser, isPaid: e.target.checked})}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Usuário Pagante</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newUser.isAdmin}
                      onChange={(e) => setNewUser({...newUser, isAdmin: e.target.checked})}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Administrador</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="btn-outline"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddUser}
                  className="btn-primary"
                >
                  Adicionar Usuário
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 