'use client'

import { useState, useEffect } from 'react'
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
import { 
  getAllUsers, 
  getAllAdminUsers,
  getTestimonials, 
  updateTestimonialStatus, 
  deleteUserByAdmin,
  createUserByAdmin,
  onUsersChange,
  onAdminUsersChange,
  onTestimonialsChange,
  getCourses
} from '@/lib/firebase'
import { User, Testimonial } from '@/types'

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [users, setUsers] = useState<User[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    isPaid: false,
    isAdmin: false,
    selectedCourse: '' // Novo campo para curso selecionado
  })
  const [courses, setCourses] = useState<any[]>([])
  const [loadingCourses, setLoadingCourses] = useState(false)

  // Verificar se é admin
  const isAdmin = user?.email === 'claudioghabryel.cg@gmail.com' || 
                  user?.email === 'natalhia775@gmail.com' || 
                  user?.email === 'claudioghabryel7@gmail.com' ||
                  user?.isAdmin === true

  // Carregar dados do Firebase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        console.log('Loading admin data...')
        
        // Carregar usuários registrados
        const usersData = await getAllUsers()
        console.log('Regular users loaded in admin:', usersData?.length || 0)
        
        // Carregar usuários criados pelo admin
        const adminUsersData = await getAllAdminUsers()
        console.log('Admin users loaded in admin:', adminUsersData?.length || 0)
        
        // Combinar usuários regulares e admin
        const allUsers = [...(usersData || []), ...(adminUsersData || [])]
        setUsers(allUsers)
        console.log('Total users in admin:', allUsers.length)
        
        // Carregar depoimentos
        const allTestimonials = await getTestimonials('all')
        console.log('Testimonials loaded in admin:', allTestimonials?.length || 0)
        setTestimonials(allTestimonials || [])
        
        // Carregar cursos
        setLoadingCourses(true)
        const coursesData = await getCourses()
        setCourses(coursesData || [])
        setLoadingCourses(false)
        console.log('Courses loaded in admin:', coursesData?.length || 0)
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        setUsers([])
        setTestimonials([])
      } finally {
        setLoading(false)
      }
    }

    if (isAdmin) {
      loadData()
    }
  }, [isAdmin])

  // Listeners em tempo real
  useEffect(() => {
    if (!isAdmin) return

    // Listener para mudanças nos usuários regulares
    const unsubscribeUsers = onUsersChange((data: any[]) => {
      console.log('Regular users real-time update:', data.length)
      setUsers(prevUsers => {
        // Combinar com admin users existentes
        const adminUsers = prevUsers.filter((u: any) => u.createdByAdmin)
        return [...data, ...adminUsers]
      })
    })

    // Listener para mudanças nos usuários admin
    const unsubscribeAdminUsers = onAdminUsersChange((data: any[]) => {
      console.log('Admin users real-time update:', data.length)
      setUsers(prevUsers => {
        // Combinar com regular users existentes
        const regularUsers = prevUsers.filter((u: any) => !u.createdByAdmin)
        return [...regularUsers, ...data]
      })
    })

    // Listener para mudanças nos depoimentos
    const unsubscribeTestimonials = onTestimonialsChange((data: any[]) => {
      console.log('Testimonials real-time update:', data.length)
      setTestimonials(data || [])
    })

    return () => {
      unsubscribeUsers()
      unsubscribeAdminUsers()
      unsubscribeTestimonials()
    }
  }, [isAdmin]) // Removida a dependência 'users' que causava o loop

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

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h2>
          <p className="text-gray-600 mb-4">Você não tem permissão para acessar esta página.</p>
          <p className="text-sm text-gray-500 mb-4">Email atual: {user.email}</p>
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

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.selectedCourse) {
      alert('Por favor, preencha todos os campos, incluindo a seleção do curso.')
      return
    }

    try {
      console.log('Adding new user:', newUser.email)
      
      const userData = {
        displayName: newUser.name,
        email: newUser.email,
        password: newUser.password,
        isPaid: newUser.isPaid,
        isAdmin: newUser.isAdmin,
        selectedCourse: newUser.selectedCourse // Adicionar curso selecionado
      }

      const userId = await createUserByAdmin(userData)
      console.log('User created successfully:', userId)
      
      setNewUser({ name: '', email: '', password: '', isPaid: false, isAdmin: false, selectedCourse: '' })
      setShowAddUserModal(false)
      alert('Usuário adicionado com sucesso!')
      
      // Recarregar dados após adicionar usuário
      const updatedUsers = await getAllUsers()
      const updatedAdminUsers = await getAllAdminUsers()
      const allUpdatedUsers = [...(updatedUsers || []), ...(updatedAdminUsers || [])]
      setUsers(allUpdatedUsers)
      
    } catch (error: any) {
      console.error('Erro ao adicionar usuário:', error)
      
      // Se der erro de permissão, criar localmente temporariamente
      if (error.message?.includes('permissions') || error.code === 'permission-denied') {
        console.log('Firebase permissions error, creating user locally...')
        
        // Criar usuário localmente
        const localUser = {
          uid: `local_${Date.now()}`,
          email: newUser.email,
          displayName: newUser.name,
          photoURL: '',
          isPaid: newUser.isPaid,
          isAdmin: newUser.isAdmin,
          isActive: true,
          studyTime: 0,
          cardsStudied: 0,
          cardsCorrect: 0,
          cardsWrong: 0,
          selectedCourse: newUser.selectedCourse,
          createdByAdmin: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        // Adicionar à lista local
        setUsers(prevUsers => [...prevUsers, localUser as any])
        
        setNewUser({ name: '', email: '', password: '', isPaid: false, isAdmin: false, selectedCourse: '' })
        setShowAddUserModal(false)
        alert('Usuário adicionado localmente (Firebase temporariamente indisponível)')
        return
      }
      
      alert(`Erro ao adicionar usuário: ${error.message || 'Tente novamente.'}`)
    }
  }

  const handleApproveTestimonial = async (testimonialId: string) => {
    try {
      console.log('Approving testimonial:', testimonialId)
      await updateTestimonialStatus(testimonialId, 'approved')
      alert('Depoimento aprovado com sucesso!')
      
      // Recarregar depoimentos após aprovar
      const updatedTestimonials = await getTestimonials('all')
      setTestimonials(updatedTestimonials || [])
      
    } catch (error: any) {
      console.error('Erro ao aprovar depoimento:', error)
      alert(`Erro ao aprovar depoimento: ${error.message || 'Tente novamente!'}`)
    }
  }

  const handleRejectTestimonial = async (testimonialId: string) => {
    try {
      console.log('Rejecting testimonial:', testimonialId)
      await updateTestimonialStatus(testimonialId, 'rejected')
      alert('Depoimento rejeitado com sucesso!')
      
      // Recarregar depoimentos após rejeitar
      const updatedTestimonials = await getTestimonials('all')
      setTestimonials(updatedTestimonials || [])
      
    } catch (error: any) {
      console.error('Erro ao rejeitar depoimento:', error)
      alert(`Erro ao rejeitar depoimento: ${error.message || 'Tente novamente!'}`)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        console.log('Deleting user:', userId)
        await deleteUserByAdmin(userId)
        alert('Usuário excluído com sucesso!')
        
        // Recarregar usuários após excluir
        const updatedUsers = await getAllUsers()
        setUsers(updatedUsers || [])
        
      } catch (error: any) {
        console.error('Erro ao excluir usuário:', error)
        alert(`Erro ao excluir usuário: ${error.message || 'Tente novamente!'}`)
      }
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  const pendingTestimonials = (testimonials || []).filter(t => t.status === 'pending')
  const approvedTestimonials = (testimonials || []).filter(t => t.status === 'approved')
  const payingUsers = (users || []).filter(u => u.isPaid)

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
                    <p className="text-2xl font-bold text-gray-900">{(users || []).length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <CheckIcon className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Usuários Pagantes</p>
                    <p className="text-2xl font-bold text-gray-900">{payingUsers.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <ChatBubbleLeftRightIcon className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Depoimentos</p>
                    <p className="text-2xl font-bold text-gray-900">{(testimonials || []).length}</p>
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
                {pendingTestimonials.length > 0 && (
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
                )}
                {(users || []).length === 0 && (
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Nenhum usuário registrado</p>
                      <p className="text-sm text-gray-600">Aguarde novos registros</p>
                    </div>
                  </div>
                )}
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

            {(users || []).length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum usuário encontrado</h3>
                <p className="text-gray-600">Aguarde novos registros de usuários.</p>
              </div>
            ) : (
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
                    {(users || []).map((user) => (
                      <tr key={user.uid}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.displayName || 'Usuário'}</div>
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
                          {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('pt-BR') : 'Nunca'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {user.cardsStudied || 0} flashcards estudados
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.studyTime || 0} min de estudo
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-primary-600 hover:text-primary-900 mr-3">
                            Editar
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.uid)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remover
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
                  {(pendingTestimonials || []).map((testimonial) => (
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
                            <span>{testimonial.createdAt ? new Date(testimonial.createdAt).toLocaleDateString('pt-BR') : 'Data não disponível'}</span>
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
              {(approvedTestimonials || []).length === 0 ? (
                <p className="text-gray-600 text-center py-8">Nenhum depoimento aprovado ainda.</p>
              ) : (
                <div className="space-y-4">
                  {(approvedTestimonials || []).map((testimonial) => (
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
                            <span>{testimonial.createdAt ? new Date(testimonial.createdAt).toLocaleDateString('pt-BR') : 'Data não disponível'}</span>
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
              )}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Curso de Acesso
                  </label>
                  {loadingCourses ? (
                    <div className="text-sm text-gray-500">Carregando cursos...</div>
                  ) : (
                    <select
                      value={newUser.selectedCourse}
                      onChange={(e) => setNewUser({...newUser, selectedCourse: e.target.value})}
                      className="input-field"
                    >
                      <option value="">Selecione um curso</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.name}
                        </option>
                      ))}
                    </select>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    O usuário terá acesso completo ao curso selecionado
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
    </div>
  )
} 