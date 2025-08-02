'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function DebugPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState('')
  const [courses, setCourses] = useState<any[]>([])

  const createTestCourse = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/create-test-course', {
        method: 'POST'
      })
      const result = await response.json()
      
      if (response.ok) {
        toast.success('Curso de teste criado com sucesso!')
        checkUserAccess()
      } else {
        toast.error(result.error || 'Erro ao criar curso')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao criar curso de teste')
    } finally {
      setLoading(false)
    }
  }

  const checkUserAccess = async () => {
    if (!user?.uid) {
      toast.error('Usuário não logado')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/admin/check-user-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.uid })
      })
      const result = await response.json()
      
      if (response.ok) {
        setDebugInfo(result)
        console.log('Debug info:', result)
      } else {
        toast.error(result.error || 'Erro ao verificar acesso')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao verificar acesso')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      checkUserAccess()
      loadCourses()
    }
  }, [user])

  const loadCourses = async () => {
    try {
      const response = await fetch('/api/courses')
      if (response.ok) {
        const coursesData = await response.json()
        setCourses(coursesData)
      }
    } catch (error) {
      console.error('Erro ao carregar cursos:', error)
    }
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug - Sistema de Acesso</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Ações</h2>
            <div className="space-y-4">
              <button
                onClick={createTestCourse}
                disabled={loading}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Criando...' : 'Criar Curso de Teste'}
              </button>
              
                             <button
                 onClick={checkUserAccess}
                 disabled={loading}
                 className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
               >
                 {loading ? 'Verificando...' : 'Verificar Acesso'}
               </button>

               <div className="border-t pt-4">
                 <h3 className="font-semibold mb-2">Atualizar Acesso do Usuário</h3>
                 <select
                   value={selectedCourse}
                   onChange={(e) => setSelectedCourse(e.target.value)}
                   className="w-full p-2 border rounded mb-2"
                 >
                   <option value="">Selecione um curso</option>
                   {courses.map((course) => (
                     <option key={course.id} value={course.name}>
                       {course.name}
                     </option>
                   ))}
                 </select>
                 <button
                   onClick={async () => {
                     if (!selectedCourse) {
                       toast.error('Selecione um curso')
                       return
                     }
                     try {
                       setLoading(true)
                       const response = await fetch('/api/admin/update-user-access', {
                         method: 'POST',
                         headers: {
                           'Content-Type': 'application/json',
                         },
                         body: JSON.stringify({
                           userId: user.uid,
                           courseName: selectedCourse,
                           isPaid: true
                         })
                       })
                       const result = await response.json()
                       
                       if (response.ok) {
                         toast.success('Acesso atualizado com sucesso!')
                         checkUserAccess()
                       } else {
                         toast.error(result.error || 'Erro ao atualizar acesso')
                       }
                     } catch (error) {
                       console.error('Erro:', error)
                       toast.error('Erro ao atualizar acesso')
                     } finally {
                       setLoading(false)
                     }
                   }}
                   disabled={loading || !selectedCourse}
                   className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                 >
                   {loading ? 'Atualizando...' : 'Atualizar Acesso'}
                 </button>
               </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Informações do Usuário</h2>
            <div className="space-y-2">
              <p><strong>UID:</strong> {user.uid}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Nome:</strong> {user.displayName}</p>
              <p><strong>Admin:</strong> {user.isAdmin ? 'Sim' : 'Não'}</p>
              <p><strong>Pago:</strong> {user.isPaid ? 'Sim' : 'Não'}</p>
            </div>
          </div>
        </div>

        {debugInfo && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Informações de Debug</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Status do Usuário</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Pago:</strong> {debugInfo.userIsPaid ? 'Sim' : 'Não'}</p>
                  <p><strong>Admin:</strong> {debugInfo.userIsAdmin ? 'Sim' : 'Não'}</p>
                  <p><strong>Curso Selecionado:</strong> {debugInfo.userSelectedCourse || 'Nenhum'}</p>
                  <p><strong>Tem Acesso:</strong> {debugInfo.userHasAccess ? 'Sim' : 'Não'}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Cursos</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Total de Cursos:</strong> {debugInfo.allCourses?.length || 0}</p>
                  <p><strong>Cursos Acessíveis:</strong> {debugInfo.accessibleCourses?.length || 0}</p>
                </div>
              </div>
            </div>

            {debugInfo.user && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Dados Completos do Usuário</h3>
                <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                  {JSON.stringify(debugInfo.user, null, 2)}
                </pre>
              </div>
            )}

            {debugInfo.allCourses && debugInfo.allCourses.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Todos os Cursos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {debugInfo.allCourses.map((course: any) => (
                    <div key={course.id} className="border p-3 rounded">
                      <p><strong>ID:</strong> {course.id}</p>
                      <p><strong>Nome:</strong> {course.name}</p>
                      <p><strong>Preço:</strong> R$ {course.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {debugInfo.accessibleCourses && debugInfo.accessibleCourses.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Cursos Acessíveis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {debugInfo.accessibleCourses.map((course: any) => (
                    <div key={course.id} className="border p-3 rounded bg-green-50">
                      <p><strong>ID:</strong> {course.id}</p>
                      <p><strong>Nome:</strong> {course.name}</p>
                      <p><strong>Preço:</strong> R$ {course.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 