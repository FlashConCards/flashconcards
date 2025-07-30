'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import {
  getAllUsers,
  getTestimonials,
  updateTestimonialStatus,
  createUserByAdmin,
  deleteUserByAdmin,
  getCourses,
  onUsersChange,
  onTestimonialsChange,
  onCoursesChange
} from '@/lib/firebase';

interface User {
  uid: string;
  email: string;
  displayName: string;
  isAdmin: boolean;
  isPaid: boolean;
  isActive: boolean;
  studyTime: number;
  cardsStudied: number;
  cardsCorrect: number;
  cardsWrong: number;
  createdByAdmin?: boolean;
  selectedCourse?: string;
  lastLoginAt?: any;
  createdAt?: any;
  updatedAt?: any;
}

interface Testimonial {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}

interface Course {
  id: string;
  name: string;
  description: string;
  price: number;
  createdAt: any;
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    displayName: '',
    password: '123456',
    isAdmin: false,
    isPaid: false,
    isActive: true,
    selectedCourse: ''
  });

  // Check if user is admin
  useEffect(() => {
    if (user && !user.isAdmin) {
      router.push('/dashboard');
    } else if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const loadData = async () => {
    try {
      console.log('Loading admin data...')
      const usersData = await getAllUsers()
      console.log('Users loaded in admin:', usersData?.length || 0)
      setUsers(usersData || [])
      
      const allTestimonials = await getTestimonials('all')
      console.log('Testimonials loaded in admin:', allTestimonials?.length || 0)
      setTestimonials(allTestimonials || [])
      
      setLoadingCourses(true)
      const coursesData = await getCourses()
      setCourses(coursesData || [])
      setLoadingCourses(false)
      console.log('Courses loaded in admin:', coursesData?.length || 0)
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      setUsers([])
      setTestimonials([])
    }
  };

  useEffect(() => {
    if (user?.isAdmin) {
      loadData();
      setLoading(false);
    }
  }, [user]);

  // Real-time listeners
  useEffect(() => {
    if (!user?.isAdmin) return;

    const unsubscribeUsers = onUsersChange((data) => {
      console.log('Users real-time update:', data.length);
      setUsers(data);
    });

    const unsubscribeTestimonials = onTestimonialsChange((data) => {
      console.log('Testimonials real-time update:', data.length);
      setTestimonials(data);
    });

    const unsubscribeCourses = onCoursesChange((data) => {
      console.log('Courses real-time update:', data.length);
      setCourses(data);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeTestimonials();
      unsubscribeCourses();
    };
  }, [user?.isAdmin]);

  const handleAddUser = async () => {
    try {
      if (!newUser.email || !newUser.displayName || !newUser.selectedCourse) {
        alert('Preencha todos os campos obrigatórios');
        return;
      }

      console.log('Adding user:', newUser);
      await createUserByAdmin(newUser);
      
      // Reload data to update UI
      await loadData();
      
      setNewUser({
        email: '',
        displayName: '',
        password: '123456',
        isAdmin: false,
        isPaid: false,
        isActive: true,
        selectedCourse: ''
      });
      setShowAddUserModal(false);
      alert('Usuário adicionado com sucesso!');
    } catch (error: any) {
      console.error('Error adding user:', error);
      alert(`Erro ao adicionar usuário: ${error.message}`);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await deleteUserByAdmin(uid);
        await loadData();
        alert('Usuário excluído com sucesso!');
      } catch (error: any) {
        console.error('Error deleting user:', error);
        alert(`Erro ao excluir usuário: ${error.message}`);
      }
    }
  };

  const handleTestimonialStatus = async (testimonialId: string, status: 'approved' | 'rejected') => {
    try {
      await updateTestimonialStatus(testimonialId, status);
      alert('Status atualizado com sucesso!');
    } catch (error: any) {
      console.error('Error updating testimonial status:', error);
      alert(`Erro ao atualizar status: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return null;
  }

  const paidUsers = users.filter(u => u.isPaid).length;
  const pendingTestimonials = testimonials.filter(t => t.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Painel Administrativo</h1>
        
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700">Total de Usuários</h3>
            <p className="text-3xl font-bold text-blue-600">{users.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700">Usuários Pagantes</h3>
            <p className="text-3xl font-bold text-green-600">{paidUsers}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700">Total de Depoimentos</h3>
            <p className="text-3xl font-bold text-purple-600">{testimonials.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700">Aguardando Aprovação</h3>
            <p className="text-3xl font-bold text-orange-600">{pendingTestimonials}</p>
          </div>
        </div>

        {/* Users Section */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Usuários</h2>
              <button
                onClick={() => setShowAddUserModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Adicionar Usuário
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Curso</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.uid}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.displayName}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isPaid ? 'Pago' : 'Não Pago'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.selectedCourse || 'Nenhum'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteUser(user.uid)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Depoimentos</h2>
          </div>
          <div className="p-6">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="border-b border-gray-200 py-4 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.email}</p>
                    <p className="text-gray-700 mt-2">{testimonial.message}</p>
                  </div>
                  <div className="flex space-x-2">
                    {testimonial.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleTestimonialStatus(testimonial.id, 'approved')}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Aprovar
                        </button>
                        <button
                          onClick={() => handleTestimonialStatus(testimonial.id, 'rejected')}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                          Rejeitar
                        </button>
                      </>
                    )}
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      testimonial.status === 'approved' ? 'bg-green-100 text-green-800' :
                      testimonial.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {testimonial.status === 'approved' ? 'Aprovado' :
                       testimonial.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Adicionar Usuário</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="usuario@exemplo.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={newUser.displayName}
                  onChange={(e) => setNewUser({...newUser, displayName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome do usuário"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Curso de Acesso *
                </label>
                {loadingCourses ? (
                  <div className="text-sm text-gray-500">Carregando cursos...</div>
                ) : (
                  <select
                    value={newUser.selectedCourse}
                    onChange={(e) => setNewUser({...newUser, selectedCourse: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPaid"
                  checked={newUser.isPaid}
                  onChange={(e) => setNewUser({...newUser, isPaid: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPaid" className="ml-2 block text-sm text-gray-900">
                  Usuário pagante
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAdmin"
                  checked={newUser.isAdmin}
                  onChange={(e) => setNewUser({...newUser, isAdmin: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isAdmin" className="ml-2 block text-sm text-gray-900">
                  Administrador
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddUserModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 