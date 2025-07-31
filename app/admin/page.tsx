'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { 
  getAllUsers, 
  getTestimonials, 
  getCourses,
  getUserPayments,
  updatePaymentStatus,
  updateUser,
  createUserByAdmin,
  deleteUserByAdmin
} from '@/lib/firebase';

interface User {
  id: string;
  displayName: string;
  email: string;
  isPaid: boolean;
  selectedCourse: string;
  createdAt: any;
  lastLoginAt: any;
}

interface Testimonial {
  id: string;
  name: string;
  content: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}

interface Payment {
  id: string;
  userId: string;
  courseId: string;
  amount: number;
  status: 'pending' | 'approved' | 'refunded' | 'failed';
  paymentMethod: string;
  createdAt: any;
  updatedAt: any;
}

interface Course {
  id: string;
  name: string;
  price: number;
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    displayName: '',
    selectedCourse: '',
    password: ''
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [financialMetrics, setFinancialMetrics] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalPayments: 0,
    pendingPayments: 0,
    refundedPayments: 0
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
      setLoading(true);
      
      // Carregar dados básicos
      const [usersData, testimonialsData, coursesData] = await Promise.all([
        getAllUsers(),
        getTestimonials(),
        getCourses()
      ]);
      
      setUsers(usersData || []);
      setTestimonials(testimonialsData || []);
      setCourses(coursesData || []);

      // Carregar pagamentos de todos os usuários
      const allPayments: Payment[] = [];
      for (const user of usersData || []) {
        const userPayments = await getUserPayments(user.id);
        allPayments.push(...userPayments);
      }
      setPayments(allPayments);

      // Calcular métricas financeiras
      calculateFinancialMetrics(allPayments);
      
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setLoading(false);
    }
  };

  const calculateFinancialMetrics = (payments: Payment[]) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const totalRevenue = payments
      .filter(p => p.status === 'approved')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const monthlyRevenue = payments
      .filter(p => {
        const paymentDate = p.createdAt?.toDate?.() || new Date(p.createdAt);
        return p.status === 'approved' && 
               paymentDate.getMonth() === currentMonth &&
               paymentDate.getFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const totalPayments = payments.length;
    const pendingPayments = payments.filter(p => p.status === 'pending').length;
    const refundedPayments = payments.filter(p => p.status === 'refunded').length;

    setFinancialMetrics({
      totalRevenue,
      monthlyRevenue,
      totalPayments,
      pendingPayments,
      refundedPayments
    });
  };

  useEffect(() => {
    if (user?.isAdmin) {
      loadData();
    }
  }, [user]);

  const handleAddUser = async () => {
    try {
      if (!newUser.email || !newUser.displayName || !newUser.selectedCourse || !newUser.password) {
        alert('Preencha todos os campos obrigatórios');
        return;
      }

      if (newUser.password.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres');
        return;
      }

      console.log('Adding user:', { ...newUser, password: '***' });
      
      // Criar usuário usando a função do Firebase
      await createUserByAdmin({
        email: newUser.email,
        displayName: newUser.displayName,
        password: newUser.password,
        selectedCourse: newUser.selectedCourse,
        isPaid: false,
        isAdmin: false
      });
      
      await loadData();
      
      setNewUser({
        email: '',
        displayName: '',
        selectedCourse: '',
        password: ''
      });
      setShowAddModal(false);
      alert('Usuário adicionado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao adicionar usuário:', error);
      alert(`Erro ao adicionar usuário: ${error.message}`);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await deleteUserByAdmin(userId);
        await loadData();
        alert('Usuário excluído com sucesso!');
      } catch (error: any) {
        console.error('Erro ao excluir usuário:', error);
        alert(`Erro ao excluir usuário: ${error.message}`);
      }
    }
  };

  const handleRefundUser = async (userId: string) => {
    if (confirm('Tem certeza que deseja reembolsar este usuário? Isso irá remover o acesso ao curso.')) {
      try {
        // Atualizar status do pagamento para reembolsado
        const userPayments = payments.filter(p => p.userId === userId && p.status === 'approved');
        for (const payment of userPayments) {
          await updatePaymentStatus(payment.id, 'refunded');
        }

        // Remover acesso do usuário ao curso
        await updateUser(userId, { selectedCourse: '', isPaid: false });
        
        await loadData();
        alert('Usuário reembolsado com sucesso!');
      } catch (error: any) {
        console.error('Erro ao reembolsar usuário:', error);
        alert(`Erro ao reembolsar usuário: ${error.message}`);
      }
    }
  };

  const handleCheckEmail = async () => {
    try {
      const email = prompt('Digite o email para verificar:');
      if (!email) return;

      const emailExists = users.some(user => user.email === email);
      alert(emailExists ? 'Email já cadastrado!' : 'Email disponível!');
    } catch (error) {
      console.error('Erro ao verificar email:', error);
    }
  };

  const handleRefreshData = async () => {
    await loadData();
    alert('Dados atualizados!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados administrativos...</p>
        </div>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return null;
  }

  const paidUsers = users.filter(user => user.isPaid);
  const pendingTestimonials = testimonials.filter(testimonial => testimonial.status === 'pending');

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Painel Administrativo</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => router.push('/admin/courses')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Gerenciar Cursos
            </button>
            <button
              onClick={() => router.push('/admin/deepening')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Aprofundamentos
            </button>
          </div>
        </div>

        {/* Métricas Financeiras */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Receita Total</h3>
            <p className="text-3xl font-bold text-green-600">
              R$ {financialMetrics.totalRevenue.toFixed(2).replace('.', ',')}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Receita do Mês</h3>
            <p className="text-3xl font-bold text-blue-600">
              R$ {financialMetrics.monthlyRevenue.toFixed(2).replace('.', ',')}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Total de Pagamentos</h3>
            <p className="text-3xl font-bold text-purple-600">{financialMetrics.totalPayments}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Pagamentos Pendentes</h3>
            <p className="text-3xl font-bold text-yellow-600">{financialMetrics.pendingPayments}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Reembolsos</h3>
            <p className="text-3xl font-bold text-red-600">{financialMetrics.refundedPayments}</p>
          </div>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Total de Usuários</h3>
            <p className="text-3xl font-bold text-blue-600">{users.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Usuários Pagantes</h3>
            <p className="text-3xl font-bold text-green-600">{paidUsers.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Total de Depoimentos</h3>
            <p className="text-3xl font-bold text-purple-600">{testimonials.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Aguardando Aprovação</h3>
            <p className="text-3xl font-bold text-yellow-600">{pendingTestimonials.length}</p>
          </div>
        </div>

        {/* Usuários */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Usuários ({users.length})</h2>
              <div className="flex space-x-2">
                <button
                  onClick={handleRefreshData}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                >
                  Atualizar
                </button>
                <button
                  onClick={handleCheckEmail}
                  className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                >
                  Verificar Email
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  Adicionar Usuário
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            {users.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum usuário registrado ainda.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        USUÁRIO
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        STATUS
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CURSO
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        AÇÕES
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.displayName}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isPaid 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isPaid ? 'Pago' : 'Não Pago'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.selectedCourse || 'Nenhum'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleRefundUser(user.id)}
                              className="text-orange-600 hover:text-orange-900"
                            >
                              Reembolsar
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Pagamentos */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Pagamentos ({payments.length})</h2>
          </div>
          <div className="p-6">
            {payments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum pagamento registrado ainda.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        USUÁRIO
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CURSO
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        VALOR
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        STATUS
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        DATA
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map((payment) => {
                      const user = users.find(u => u.id === payment.userId);
                      const course = courses.find(c => c.id === payment.courseId);
                      
                      return (
                        <tr key={payment.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user?.displayName || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{user?.email || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {course?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            R$ {payment.amount?.toFixed(2).replace('.', ',') || '0,00'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              payment.status === 'approved' ? 'bg-green-100 text-green-800' :
                              payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              payment.status === 'refunded' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {payment.status === 'approved' ? 'Aprovado' :
                               payment.status === 'pending' ? 'Pendente' :
                               payment.status === 'refunded' ? 'Reembolsado' :
                               'Falhou'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {payment.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Adicionar Usuário</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={newUser.displayName}
                    onChange={(e) => setNewUser({...newUser, displayName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome completo"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Curso *
                  </label>
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha *
                  </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Digite a senha do usuário"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Senha mínima de 6 caracteres (padrão: 123456)
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
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
    </div>
  );
} 