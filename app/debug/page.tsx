'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { createFlashcard, getFlashcards } from '@/lib/firebase'
import toast from 'react-hot-toast'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function DebugPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState('')
  const [courses, setCourses] = useState<any[]>([])
  const [subjectsDebug, setSubjectsDebug] = useState<any>(null)

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

  const debugSubjects = async () => {
    if (!selectedCourse) {
      toast.error('Selecione um curso primeiro')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/admin/debug-subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId: selectedCourse })
      })
      const result = await response.json()
      
      if (response.ok) {
        setSubjectsDebug(result)
        console.log('Subjects debug:', result)
        toast.success('Debug das matérias realizado!')
      } else {
        toast.error(result.error || 'Erro ao debug das matérias')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao debug das matérias')
    } finally {
      setLoading(false)
    }
  }

  const testFlashcardCreation = async () => {
    try {
      setLoading(true);
      
      // Usar o subTopicId real do seu sistema
      const realSubTopicId = 'uSqKKFCXMFfzwJMkQNvE'; // Use o ID que aparece nos logs
      
      // Testar criação de flashcard
      const testFlashcard = {
        front: 'Teste de Flashcard - Compreensão Textual',
        back: 'Resposta de teste para compreensão textual',
        explanation: 'Explicação de teste para ajudar no aprendizado',
        subTopicId: realSubTopicId,
        order: 1,
        isActive: true,
        aiGenerated: true,
        difficulty: 'medium',
        questionType: 'objective'
      };
      
      console.log('=== TESTE DE CRIAÇÃO DE FLASHCARD ===');
      console.log('Criando flashcard de teste:', testFlashcard);
      
      const result = await createFlashcard(testFlashcard);
      console.log('Flashcard criado com sucesso:', result);
      
      // Aguardar um pouco para o Firebase processar
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Buscar flashcards
      console.log('=== TESTE DE RECUPERAÇÃO ===');
      console.log('Buscando flashcards para subTopicId:', realSubTopicId);
      
      const flashcards = await getFlashcards(realSubTopicId);
      console.log('Flashcards encontrados:', flashcards);
      console.log('Quantidade encontrada:', flashcards.length);
      
      if (flashcards.length > 0) {
        console.log('Primeiro flashcard encontrado:', flashcards[0]);
        toast.success(`Teste concluído! ${flashcards.length} flashcards encontrados.`);
      } else {
        console.warn('Nenhum flashcard encontrado');
        toast.error('Teste falhou: nenhum flashcard foi encontrado');
      }
      
    } catch (error: any) {
      console.error('Erro no teste:', error);
      toast.error(`Erro no teste: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkExistingFlashcards = async () => {
    try {
      setLoading(true);
      
      console.log('=== VERIFICANDO FLASHCARDS EXISTENTES ===');
      
      // Verificar todos os flashcards na coleção
      const allFlashcards = await getDocs(collection(db, 'flashcards'));
      console.log('Total de flashcards na coleção:', allFlashcards.size);
      
      if (allFlashcards.size > 0) {
        console.log('=== FLASHCARDS ENCONTRADOS ===');
        allFlashcards.forEach((doc) => {
          const data = doc.data();
          console.log('Flashcard:', {
            id: doc.id,
            front: data.front,
            back: data.back,
            subTopicId: data.subTopicId,
            isActive: data.isActive,
            aiGenerated: data.aiGenerated,
            createdAt: data.createdAt
          });
        });
        
        // Agrupar por subTopicId
        const flashcardsBySubTopic: { [key: string]: any[] } = {};
        allFlashcards.forEach((doc) => {
          const data = doc.data();
          const subTopicId = data.subTopicId;
          if (!flashcardsBySubTopic[subTopicId]) {
            flashcardsBySubTopic[subTopicId] = [];
          }
          flashcardsBySubTopic[subTopicId].push({ id: doc.id, ...data });
        });
        
        console.log('=== FLASHCARDS AGRUPADOS POR SUBTÓPICO ===');
        Object.keys(flashcardsBySubTopic).forEach(subTopicId => {
          console.log(`SubTópico ${subTopicId}:`, flashcardsBySubTopic[subTopicId].length, 'flashcards');
        });
        
        toast.success(`Encontrados ${allFlashcards.size} flashcards no total`);
      } else {
        console.log('Nenhum flashcard encontrado na coleção');
        toast.error('Nenhum flashcard encontrado na coleção');
      }
      
    } catch (error: any) {
      console.error('Erro ao verificar flashcards:', error);
      toast.error(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

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

              <button
                onClick={debugSubjects}
                disabled={loading || !selectedCourse}
                className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                {loading ? 'Verificando...' : 'Debug Matérias'}
              </button>

              <button
                onClick={testFlashcardCreation}
                disabled={loading}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Testando...' : 'Testar Criação de Flashcards'}
              </button>

              <button
                onClick={checkExistingFlashcards}
                disabled={loading}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Verificando...' : 'Verificar Flashcards Existentes'}
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

         {subjectsDebug && (
           <div className="bg-white p-6 rounded-lg shadow mt-6">
             <h2 className="text-xl font-semibold mb-4">Debug das Matérias</h2>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div>
                 <h3 className="font-semibold mb-2">Cursos</h3>
                 <div className="space-y-1 text-sm">
                   <p><strong>Total de Cursos:</strong> {subjectsDebug.allCourses?.length || 0}</p>
                   {subjectsDebug.allCourses?.map((course: any) => (
                     <div key={course.id} className="border p-2 rounded">
                       <p><strong>ID:</strong> {course.id}</p>
                       <p><strong>Nome:</strong> {course.name}</p>
                     </div>
                   ))}
                 </div>
               </div>

               <div>
                 <h3 className="font-semibold mb-2">Todas as Matérias</h3>
                 <div className="space-y-1 text-sm">
                   <p><strong>Total de Matérias:</strong> {subjectsDebug.allSubjects?.length || 0}</p>
                   {subjectsDebug.allSubjects?.map((subject: any) => (
                     <div key={subject.id} className="border p-2 rounded">
                       <p><strong>ID:</strong> {subject.id}</p>
                       <p><strong>Nome:</strong> {subject.name}</p>
                       <p><strong>Curso ID:</strong> {subject.courseId}</p>
                     </div>
                   ))}
                 </div>
               </div>

               <div>
                 <h3 className="font-semibold mb-2">Matérias do Curso Selecionado</h3>
                 <div className="space-y-1 text-sm">
                   <p><strong>Curso ID:</strong> {subjectsDebug.courseId}</p>
                   <p><strong>Matérias:</strong> {subjectsDebug.courseSubjects?.length || 0}</p>
                   {subjectsDebug.courseSubjects?.map((subject: any) => (
                     <div key={subject.id} className="border p-2 rounded bg-green-50">
                       <p><strong>ID:</strong> {subject.id}</p>
                       <p><strong>Nome:</strong> {subject.name}</p>
                       <p><strong>Descrição:</strong> {subject.description}</p>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
           </div>
         )}
       </div>
     </div>
   )
 } 