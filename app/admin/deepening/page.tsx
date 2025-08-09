'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  getDeepeningsBySubTopic,
  createDeepening,
  deleteDeepening,
  getSubTopics,
  getTopics,
  getSubjects,
  getCourses
} from '@/lib/firebase';

interface Deepening {
  id: string;
  subTopicId: string;
  content: string;
  createdAt: any;
  updatedAt: any;
}

interface SubTopic {
  id: string;
  name: string;
  description: string;
  topicId: string;
}

interface Topic {
  id: string;
  name: string;
  subjectId: string;
}

interface Subject {
  id: string;
  name: string;
  courseId: string;
}

interface Course {
  id: string;
  name: string;
}

export default function DeepeningPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const subTopicId = searchParams.get('subTopicId');
  const topicId = searchParams.get('topicId');
  const subjectId = searchParams.get('subjectId');
  const courseId = searchParams.get('courseId');
  
  const [deepenings, setDeepenings] = useState<Deepening[]>([]);
  const [subTopics, setSubTopics] = useState<SubTopic[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedSubTopic, setSelectedSubTopic] = useState<SubTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDeepening, setNewDeepening] = useState({
    subTopicId: '',
    content: ''
  });
  const editorRef = useRef<HTMLDivElement>(null);

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
      
      // Carregar cursos
      const coursesData = await getCourses();
      setCourses(coursesData || []);
      
      if (courseId) {
        const course = coursesData?.find(c => c.id === courseId);
        setSelectedCourse(course || null);
        
        if (course) {
          const subjectsData = await getSubjects(courseId);
          setSubjects(subjectsData || []);
          
          if (subjectId) {
            const subject = subjectsData?.find(s => s.id === subjectId);
            setSelectedSubject(subject || null);
            
            if (subject) {
              const topicsData = await getTopics(subjectId);
              setTopics(topicsData || []);
              
              if (topicId) {
                const topic = topicsData?.find(t => t.id === topicId);
                setSelectedTopic(topic || null);
                
                if (topic) {
                  const subTopicsData = await getSubTopics(topicId);
                  setSubTopics(subTopicsData || []);
                  
                  if (subTopicId) {
                    const subTopic = subTopicsData?.find(st => st.id === subTopicId);
                    setSelectedSubTopic(subTopic || null);
                    setNewDeepening({...newDeepening, subTopicId: subTopicId});
                    
                    // Carregar aprofundamentos do subtópico
                    const deepeningsData = await getDeepeningsBySubTopic(subTopicId);
                    setDeepenings(deepeningsData || []);
                  }
                }
              }
            }
          }
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [courseId, subjectId, topicId, subTopicId]);

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const insertHTML = (html: string) => {
    if (editorRef.current) {
      const selection = window.getSelection();
      const range = selection?.getRangeAt(0);
      const div = document.createElement('div');
      div.innerHTML = html;
      range?.insertNode(div);
      editorRef.current.focus();
    }
  };

  const handleAddDeepening = async () => {
    try {
      // Usar o subTopicId da URL se o newDeepening.subTopicId estiver vazio
      const finalSubTopicId = newDeepening.subTopicId || subTopicId;
      
      if (!finalSubTopicId || !newDeepening.content.trim()) {
        alert('Preencha todos os campos obrigatórios. SubTopicId e conteúdo são necessários.');
        return;
      }

      console.log('Creating deepening with data:', {
        subTopicId: finalSubTopicId,
        content: newDeepening.content,
        title: newDeepening.title || 'Aprofundamento'
      });

      await createDeepening({
        subTopicId: finalSubTopicId,
        content: newDeepening.content,
        title: newDeepening.title || 'Aprofundamento'
      });
      await loadData();
      
      setNewDeepening({
        subTopicId: '',
        content: ''
      });
      setShowAddModal(false);
      alert('Aprofundamento adicionado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao adicionar aprofundamento:', error);
      alert(`Erro ao adicionar aprofundamento: ${error.message}`);
    }
  };

  const handleDeleteDeepening = async (deepeningId: string) => {
    if (confirm('Tem certeza que deseja excluir este aprofundamento?')) {
      try {
        await deleteDeepening(deepeningId);
        await loadData();
        alert('Aprofundamento excluído com sucesso!');
      } catch (error: any) {
        console.error('Erro ao excluir aprofundamento:', error);
        alert(`Erro ao excluir aprofundamento: ${error.message}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando aprofundamentos...</p>
        </div>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gerenciar Aprofundamentos</h1>
            {selectedCourse && selectedSubject && selectedTopic && selectedSubTopic && (
              <p className="text-gray-600 mt-2">
                Curso: {selectedCourse.name} → Matéria: {selectedSubject.name} → Tópico: {selectedTopic.name} → Subtópico: {selectedSubTopic.name}
              </p>
            )}
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => router.push('/admin')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Voltar ao Painel
            </button>
            {selectedSubTopic && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Adicionar Aprofundamento
              </button>
            )}
          </div>
        </div>

        {/* SubTopics Selection */}
        {selectedTopic && subTopics.length > 0 && !selectedSubTopic && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Selecione um Subtópico</h2>
              <p className="text-gray-600 mt-1">Escolha um subtópico para gerenciar seus aprofundamentos</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subTopics.map((subTopic) => (
                  <div
                    key={subTopic.id}
                    onClick={() => router.push(`/admin/deepening?courseId=${courseId}&subjectId=${subjectId}&topicId=${topicId}&subTopicId=${subTopic.id}`)}
                    className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">{subTopic.name}</h3>
                    <p className="text-sm text-gray-600">{subTopic.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Deepenings List */}
        {selectedSubTopic && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Aprofundamentos do Subtópico "{selectedSubTopic.name}" ({deepenings.length})</h2>
            </div>
            <div className="p-6">
              {deepenings.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum aprofundamento cadastrado para este subtópico ainda.</p>
              ) : (
                <div className="space-y-4">
                  {deepenings.map((deepening) => (
                    <div key={deepening.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="prose max-w-none">
                            <div 
                              className="text-gray-700"
                              dangerouslySetInnerHTML={{ __html: deepening.content }}
                            />
                          </div>
                        </div>
                        <div className="ml-4">
                          <button
                            onClick={() => handleDeleteDeepening(deepening.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Excluir
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

        {/* Add Deepening Modal */}
        {showAddModal && selectedSubTopic && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Adicionar Aprofundamento para "{selectedSubTopic.name}"</h3>
              
              <div className="space-y-4">
                {/* Rich Text Editor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Conteúdo do Aprofundamento *
                  </label>
                  <div className="border border-gray-300 rounded-md">
                  {/* Toolbar */}
                    <div className="border-b border-gray-300 p-3 bg-gray-50">
                      <div className="flex flex-wrap gap-2">
                        {/* Formatação de texto */}
                        <div className="flex items-center space-x-1">
                      <button
                            type="button"
                        onClick={() => execCommand('bold')}
                            className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 font-bold"
                        title="Negrito"
                      >
                            B
                      </button>
                      <button
                            type="button"
                        onClick={() => execCommand('italic')}
                            className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 italic"
                        title="Itálico"
                      >
                            I
                      </button>
                      <button
                            type="button"
                        onClick={() => execCommand('underline')}
                            className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 underline"
                        title="Sublinhado"
                      >
                            U
                      </button>
                    </div>

                        {/* Tamanhos de fonte */}
                        <div className="flex items-center space-x-1">
                      <select
                            onChange={(e) => execCommand('fontSize', e.target.value)}
                            className="px-2 py-1 text-sm bg-white border border-gray-300 rounded"
                            title="Tamanho da fonte"
                          >
                            <option value="1">Pequeno</option>
                            <option value="3">Normal</option>
                            <option value="5">Grande</option>
                            <option value="7">Muito Grande</option>
                      </select>
                    </div>

                        {/* Família da fonte */}
                        <div className="flex items-center space-x-1">
                      <select
                            onChange={(e) => execCommand('fontName', e.target.value)}
                            className="px-2 py-1 text-sm bg-white border border-gray-300 rounded"
                            title="Família da fonte"
                      >
                        <option value="Arial">Arial</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Helvetica">Helvetica</option>
                      </select>
                  </div>

                        {/* Cores */}
                        <div className="flex items-center space-x-1">
                          <input
                            type="color"
                            onChange={(e) => execCommand('foreColor', e.target.value)}
                            className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                            title="Cor do texto"
                          />
                          <input
                            type="color"
                            onChange={(e) => execCommand('hiliteColor', e.target.value)}
                            className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                            title="Cor de fundo"
                  />
                </div>

                        {/* Alinhamento */}
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => execCommand('justifyLeft')}
                            className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                            title="Alinhar à esquerda"
                          >
                            ⬅️
                          </button>
                          <button
                            type="button"
                            onClick={() => execCommand('justifyCenter')}
                            className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                            title="Centralizar"
                          >
                            ↔️
                          </button>
                          <button
                            type="button"
                            onClick={() => execCommand('justifyRight')}
                            className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                            title="Alinhar à direita"
                          >
                            ➡️
                          </button>
                        </div>

                        {/* Listas */}
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => execCommand('insertUnorderedList')}
                            className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                            title="Lista com marcadores"
                          >
                            •
                          </button>
                          <button
                            type="button"
                            onClick={() => execCommand('insertOrderedList')}
                            className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                            title="Lista numerada"
                          >
                            1.
                          </button>
                        </div>

                        {/* Links e imagens */}
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => {
                              const url = prompt('Digite a URL do link:');
                              if (url) execCommand('createLink', url);
                            }}
                            className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                            title="Inserir link"
                          >
                            🔗
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const url = prompt('Digite a URL da imagem:');
                              if (url) insertHTML(`<img src="${url}" alt="Imagem" style="max-width: 100%; height: auto;" />`);
                            }}
                            className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                            title="Inserir imagem"
                          >
                            🖼️
                          </button>
                        </div>

                        {/* Limpar formatação */}
                        <button
                          type="button"
                          onClick={() => execCommand('removeFormat')}
                          className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                          title="Limpar formatação"
                        >
                          🧹
                        </button>
                  </div>
                  </div>

                    {/* Editor */}
                    <div
                      ref={editorRef}
                      contentEditable
                      onInput={(e) => setNewDeepening({...newDeepening, content: e.currentTarget.innerHTML})}
                      className="w-full p-4 min-h-[400px] focus:outline-none prose max-w-none"
                      style={{
                        fontFamily: 'Arial, sans-serif',
                        fontSize: '14px',
                        lineHeight: '1.6'
                      }}
                      data-placeholder="Digite o conteúdo do aprofundamento aqui..."
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Use a barra de ferramentas acima para formatar o texto como no Word.
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
                  onClick={handleAddDeepening}
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