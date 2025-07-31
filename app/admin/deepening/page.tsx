'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  getDeepenings,
  createDeepening,
  deleteDeepening,
  getFlashcards,
  getSubTopics,
  getTopics,
  getSubjects,
  getCourses
} from '@/lib/firebase';

interface Deepening {
  id: string;
  flashcardId: string;
  content: string;
  createdAt: any;
  updatedAt: any;
}

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  subTopicId: string;
}

interface SubTopic {
  id: string;
  name: string;
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
  const [deepenings, setDeepenings] = useState<Deepening[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [subTopics, setSubTopics] = useState<SubTopic[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedSubTopic, setSelectedSubTopic] = useState('');
  const [selectedFlashcard, setSelectedFlashcard] = useState('');
  const [newDeepening, setNewDeepening] = useState({
    flashcardId: '',
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
      
      // Carregar aprofundamentos existentes
      const deepeningsData = await getDeepenings();
      setDeepenings(deepeningsData || []);
      
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.isAdmin) {
      loadData();
    }
  }, [user]);

  const loadSubjects = async (courseId: string) => {
    try {
      const subjectsData = await getSubjects(courseId);
      setSubjects(subjectsData || []);
      setTopics([]);
      setSubTopics([]);
      setFlashcards([]);
    } catch (error) {
      console.error('Erro ao carregar matérias:', error);
    }
  };

  const loadTopics = async (subjectId: string) => {
    try {
      const topicsData = await getTopics(subjectId);
      setTopics(topicsData || []);
      setSubTopics([]);
      setFlashcards([]);
    } catch (error) {
      console.error('Erro ao carregar tópicos:', error);
    }
  };

  const loadSubTopics = async (topicId: string) => {
    try {
      const subTopicsData = await getSubTopics(topicId);
      setSubTopics(subTopicsData || []);
      setFlashcards([]);
    } catch (error) {
      console.error('Erro ao carregar sub-tópicos:', error);
    }
  };

  const loadFlashcards = async (subTopicId: string) => {
    try {
      const flashcardsData = await getFlashcards(subTopicId);
      setFlashcards(flashcardsData || []);
    } catch (error) {
      console.error('Erro ao carregar flashcards:', error);
    }
  };

  // Funções do editor rico
  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setNewDeepening({...newDeepening, content: editorRef.current.innerHTML});
    }
  };

  const insertHTML = (html: string) => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const div = document.createElement('div');
        div.innerHTML = html;
        const fragment = document.createDocumentFragment();
        while (div.firstChild) {
          fragment.appendChild(div.firstChild);
        }
        range.insertNode(fragment);
        setNewDeepening({...newDeepening, content: editorRef.current.innerHTML});
      }
    }
  };

  const handleAddDeepening = async () => {
    try {
      if (!newDeepening.flashcardId || !newDeepening.content.trim()) {
        alert('Preencha todos os campos obrigatórios');
        return;
      }

      await createDeepening(newDeepening);
      await loadData();
      
      setNewDeepening({
        flashcardId: '',
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
          <h1 className="text-3xl font-bold text-gray-800">Gerenciar Aprofundamentos</h1>
          <button
            onClick={() => router.push('/admin')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Voltar ao Painel
          </button>
        </div>

        {/* Add Deepening Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Adicionar Aprofundamento
          </button>
        </div>

        {/* Deepenings List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Aprofundamentos ({deepenings.length})</h2>
          </div>
          <div className="p-6">
            {deepenings.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum aprofundamento cadastrado ainda.</p>
            ) : (
              <div className="space-y-4">
                {deepenings.map((deepening) => (
                  <div key={deepening.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-2">Flashcard ID: {deepening.flashcardId}</h3>
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
      </div>

      {/* Add Deepening Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Adicionar Aprofundamento</h3>
            
            <div className="space-y-4">
              {/* Course Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Curso *
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => {
                    setSelectedCourse(e.target.value);
                    setSelectedSubject('');
                    setSelectedTopic('');
                    setSelectedSubTopic('');
                    setSelectedFlashcard('');
                    if (e.target.value) {
                      loadSubjects(e.target.value);
                    }
                  }}
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

              {/* Subject Selection */}
              {selectedCourse && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Matéria *
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => {
                      setSelectedSubject(e.target.value);
                      setSelectedTopic('');
                      setSelectedSubTopic('');
                      setSelectedFlashcard('');
                      if (e.target.value) {
                        loadTopics(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione uma matéria</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Topic Selection */}
              {selectedSubject && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tópico *
                  </label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => {
                      setSelectedTopic(e.target.value);
                      setSelectedSubTopic('');
                      setSelectedFlashcard('');
                      if (e.target.value) {
                        loadSubTopics(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione um tópico</option>
                    {topics.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* SubTopic Selection */}
              {selectedTopic && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sub-tópico *
                  </label>
                  <select
                    value={selectedSubTopic}
                    onChange={(e) => {
                      setSelectedSubTopic(e.target.value);
                      setSelectedFlashcard('');
                      if (e.target.value) {
                        loadFlashcards(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione um sub-tópico</option>
                    {subTopics.map((subTopic) => (
                      <option key={subTopic.id} value={subTopic.id}>
                        {subTopic.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Flashcard Selection */}
              {selectedSubTopic && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Flashcard *
                  </label>
                  <select
                    value={selectedFlashcard}
                    onChange={(e) => {
                      setSelectedFlashcard(e.target.value);
                      setNewDeepening({...newDeepening, flashcardId: e.target.value});
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione um flashcard</option>
                    {flashcards.map((flashcard) => (
                      <option key={flashcard.id} value={flashcard.id}>
                        {flashcard.question}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Rich Text Editor */}
              {selectedFlashcard && (
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
              )}
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
  );
} 