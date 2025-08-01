'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { 
  UserGroupIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  TrashIcon,
  ChevronLeftIcon,
  CreditCardIcon,
  ClockIcon,
  ChartBarIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { User } from '@/types'
import { sendGmailDirectAdminEmail } from '@/lib/email-gmail-direct'
import toast from 'react-hot-toast'

export default function AdminUsersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [newUser, setNewUser] = useState({
    displayName: '',
    email: '',
    password: '123456', // Senha padrão
    courseId: ''
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPayment, setFilterPayment] = useState('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)

  // Carregar usuários do Firebase
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      // Aqui você implementaria a busca real no Firebase
      // Por enquanto, vamos simular
      const mockUsers: User[] = [
        {
          uid: '1',
          displayName: 'João Silva',
          email: 'joao@email.com',
          photoURL: '',
          isPaid: true,
          isActive: true,
          isAdmin: false,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-20'),
          studyTime: 120,
          cardsStudied: 45,
          cardsCorrect: 38,
          cardsWrong: 7,
        },
        // ... outros usuários mockados
      ]
      setUsers(mockUsers)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      toast.error('Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async () => {
    try {
      if (!newUser.displayName || !newUser.email) {
        toast.error('Preencha todos os campos obrigatórios')
        return
      }

      console.log('🚀 Iniciando adição de usuário:', newUser)

      // Chamar API para adicionar usuário e enviar email
      const response = await fetch('/api/admin/add-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName: newUser.displayName,
          email: newUser.email,
          courseName: newUser.courseId,
          password: newUser.password
        })
      })

      console.log('📡 Resposta da API:', response.status, response.statusText)

      const result = await response.json()
      console.log('📋 Resultado da API:', result)

      if (response.ok) {
        // Adicionar usuário à lista local
        const userData = {
          uid: Date.now().toString(),
          displayName: newUser.displayName,
          email: newUser.email,
          photoURL: '',
          isPaid: false,
          isActive: true,
          isAdmin: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          studyTime: 0,
          cardsStudied: 0,
          cardsCorrect: 0,
          cardsWrong: 0,
        }

        setUsers(prev => [...prev, userData])
        toast.success(result.message)
        console.log('✅ Usuário adicionado com sucesso')

        // Limpar formulário
        setNewUser({
          displayName: '',
          email: '',
          password: '123456',
          courseId: ''
        })
        setShowAddUserModal(false)
      } else {
        console.error('❌ Erro na API:', result)
        toast.error(result.error || 'Erro ao adicionar usuário')
      }

    } catch (error) {
      console.error('❌ Erro ao adicionar usuário:', error)
      toast.error('Erro ao adicionar usuário')
    }
  }

  const handleToggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.uid === userId 
        ? { ...user, isActive: !user.isActive }
        : user
    ))
  }

  const handleTogglePaymentStatus = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.uid === userId 
        ? { ...user, isPaid: !user.isPaid }
        : user
    ))
  }

  const handleDeleteUser = (userId: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      setUsers(prev => prev.filter(user => user.uid !== userId))
    }
  }

  const handleViewUserDetails = (user: User) => {
    setSelectedUser(user)
    setShowUserModal(true)
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.isActive) ||
                         (filterStatus === 'inactive' && !user.isActive)
    const matchesPayment = filterPayment === 'all' || 
                          (filterPayment === 'paid' && user.isPaid) ||
                          (filterPayment === 'unpaid' && !user.isPaid)
    
    return matchesSearch && matchesStatus && matchesPayment
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando usuários...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">Gestão de Usuários</h1>
                <p className="text-gray-600">Gerencie os usuários da plataforma</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Adicionar Usuário</span>
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
                <UserGroupIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CreditCardIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Usuários Pagantes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.isPaid).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <EyeIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.isActive).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Média de Estudo</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.length > 0 ? Math.round(users.reduce((acc, u) => acc + u.studyTime, 0) / users.length) : 0} min
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  placeholder="Buscar usuários..."
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pagamento
              </label>
              <select
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value)}
                className="input-field"
              >
                <option value="all">Todos</option>
                <option value="paid">Pagantes</option>
                <option value="unpaid">Não Pagantes</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="btn-outline w-full">
                Exportar Lista
              </button>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Usuários ({filteredUsers.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
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
                    Pagamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progresso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.uid}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-600">
                            {user.displayName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.displayName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.isPaid
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isPaid ? 'Pago' : 'Não Pago'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-primary-600 h-2 rounded-full" 
                            style={{ 
                              width: `${user.cardsStudied > 0 ? (user.cardsCorrect / user.cardsStudied) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">
                          {user.cardsStudied > 0 ? Math.round((user.cardsCorrect / user.cardsStudied) * 100) : 0}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.updatedAt ? user.updatedAt.toLocaleDateString('pt-BR') : 'Nunca'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewUserDetails(user)}
                          className="text-primary-600 hover:text-primary-900 p-1 rounded"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(user.uid)}
                          className={`p-1 rounded ${
                            user.isActive
                              ? 'text-yellow-600 hover:text-yellow-900'
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {user.isActive ? (
                            <EyeSlashIcon className="w-4 h-4" />
                          ) : (
                            <EyeIcon className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleTogglePaymentStatus(user.uid)}
                          className={`p-1 rounded ${
                            user.isPaid
                              ? 'text-red-600 hover:text-red-900'
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          <CreditCardIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.uid)}
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

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Adicionar Novo Usuário
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={newUser.displayName}
                    onChange={(e) => setNewUser(prev => ({ ...prev, displayName: e.target.value }))}
                    className="input-field"
                    placeholder="Nome do usuário"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    className="input-field"
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Curso (Opcional)
                  </label>
                  <input
                    type="text"
                    value={newUser.courseId}
                    onChange={(e) => setNewUser(prev => ({ ...prev, courseId: e.target.value }))}
                    className="input-field"
                    placeholder="Nome do curso"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha Padrão
                  </label>
                  <input
                    type="text"
                    value={newUser.password}
                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                    className="input-field"
                    placeholder="123456"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    A senha padrão será enviada por email
                  </p>
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

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Detalhes do Usuário
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome
                    </label>
                    <p className="text-sm text-gray-900">{selectedUser.displayName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="text-sm text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Registro
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedUser.createdAt.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Último Login
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedUser.updatedAt ? selectedUser.updatedAt.toLocaleDateString('pt-BR') : 'Nunca'}
                    </p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Estatísticas de Estudo</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Tempo de Estudo</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedUser.studyTime} min</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Cards Estudados</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedUser.cardsStudied}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Acertos</p>
                      <p className="text-lg font-semibold text-green-600">{selectedUser.cardsCorrect}</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Erros</p>
                      <p className="text-lg font-semibold text-red-600">{selectedUser.cardsWrong}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Status</h4>
                  <div className="flex space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedUser.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedUser.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedUser.isPaid
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedUser.isPaid ? 'Pago' : 'Não Pago'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="btn-outline"
                >
                  Fechar
                </button>
                <button
                  onClick={() => {
                    // Implementar reset de senha
                    alert('Funcionalidade de reset de senha será implementada')
                  }}
                  className="btn-primary"
                >
                  Resetar Senha
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 