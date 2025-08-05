'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  getSubjects,
  getTopics,
  getSubTopics,
  getFlashcards,
  createSubject,
  updateSubject,
  deleteSubject,
  createTopic,
  updateTopic,
  deleteTopic,
  createSubTopic,
  updateSubTopic,
  deleteSubTopic,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard
} from '@/lib/firebase';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon,
  BookOpenIcon,
  AcademicCapIcon,
  FireIcon
} from '@heroicons/react/24/outline';

interface Subject {
  id: string;
  name: string;
  description: string;
  courseId: string;
  order: number;
  isActive: boolean;
}

interface Topic {
  id: string;
  name: string;
  description: string;
  subjectId: string;
  order: number;
  isActive: boolean;
}



interface Flashcard {
  id: string;
  front: string;
  back: string;
  explanation?: string;
  topicId: string;
  order: number;
  isActive: boolean;
}

export default function SubjectsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId') || '';
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showFlashcardModal, setShowFlashcardModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newSubject, setNewSubject] = useState({
    name: '',
    description: '',
    courseId: courseId,
    order: 1,
    isActive: true
  });
  const [newTopic, setNewTopic] = useState({
    name: '',
    subjectId: '',
    order: 1,
    isActive: true
  });
  const [newSubTopic, setNewSubTopic] = useState({
    name: '',
    topicId: '',
    order: 1,
    isActive: true
  });
  const [newFlashcard, setNewFlashcard] = useState({
    front: '',
    back: '',
    explanation: '',
    topicId: '',
    order: 1,
    isActive: true
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
      
      const subjectsData = await getSubjects();
      setSubjects(subjectsData || []);
      
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

  const loadTopics = async (subjectId: string) => {
    try {
      console.log('Carregando tópicos para subjectId:', subjectId);
      const topicsData = await getTopics(subjectId);
      console.log('Tópicos carregados:', topicsData);
      setTopics(topicsData || []);
    } catch (error) {
      console.error('Erro ao carregar tópicos:', error);
      setTopics([]);
    }
  };

  const loadFlashcards = async (topicId: string) => {
    try {
      const flashcardsData = await getFlashcards(topicId);
      setFlashcards(flashcardsData || []);
    } catch (error) {
      console.error('Erro ao carregar flashcards:', error);
      setFlashcards([]);
    }
  };

  const handleSubjectSelect = async (subject: Subject) => {
    setSelectedSubject(subject);
    setSelectedTopic(null);
    setTopics([]);
    setFlashcards([]);
    await loadTopics(subject.id);
  };

  const handleTopicSelect = async (topic: Topic) => {
    setSelectedTopic(topic);
    setFlashcards([]);
    await loadFlashcards(topic.id);
  };

  const handleCreateSubject = async () => {
    try {
      if (!newSubject.name || !newSubject.description) {
        alert('Preencha todos os campos obrigatórios');
        return;
      }

      await createSubject(newSubject);
      await loadData();
      setNewSubject({
        name: '',
        description: '',
        courseId: courseId,
        order: 1,
        isActive: true
      });
      setShowSubjectModal(false);
      alert('Matéria criada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao criar matéria:', error);
      alert(`Erro ao criar matéria: ${error.message}`);
    }
  };

  const handleCreateTopic = async () => {
    try {
      if (!newTopic.name) {
        alert('Preencha o nome do tópico');
        return;
      }

      console.log('Criando tópico com dados:', newTopic);
      console.log('Matéria selecionada:', selectedSubject);

      // Garantir que o subjectId seja definido
      const topicData = {
        ...newTopic,
        subjectId: selectedSubject?.id || newTopic.subjectId
      };

      console.log('Dados do tópico a serem salvos:', topicData);

      await createTopic(topicData);
      console.log('Tópico criado, recarregando lista...');
      await loadTopics(selectedSubject?.id || '');
      setNewTopic({
        name: '',
        subjectId: '',
        order: 1,
        isActive: true
      });
      setShowTopicModal(false);
      alert('Tópico criado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao criar tópico:', error);
      alert(`Erro ao criar tópico: ${error.message}`);
    }
  };

  const handleCreateFlashcard = async () => {
    try {
      if (!newFlashcard.front || !newFlashcard.back || !selectedTopic) {
        alert('Preencha todos os campos obrigatórios');
        return;
      }

      newFlashcard.topicId = selectedTopic.id;
      await createFlashcard(newFlashcard);
      await loadFlashcards(selectedTopic.id);
      setNewFlashcard({
        front: '',
        back: '',
        explanation: '',
        topicId: '',
        order: 1,
        isActive: true
      });
      setShowFlashcardModal(false);
      alert('Flashcard criado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao criar flashcard:', error);
      alert(`Erro ao criar flashcard: ${error.message}`);
    }
  };

  const handleEdit = (item: any, type: 'subject' | 'topic' | 'subtopic' | 'flashcard') => {
    setEditingItem({ ...item, type });
    
    switch (type) {
      case 'subject':
        setNewSubject({
          name: item.name,
          description: item.description,
          courseId: item.courseId,
          order: item.order,
          isActive: item.isActive
        });
        setShowSubjectModal(true);
        break;
      case 'topic':
        setNewTopic({
          name: item.name,
          subjectId: item.subjectId,
          order: item.order,
          isActive: item.isActive
        });
        setShowTopicModal(true);
        break;
      case 'flashcard':
        setNewFlashcard({
          front: item.front,
          back: item.back,
          explanation: item.explanation || '',
          topicId: item.topicId,
          order: item.order,
          isActive: item.isActive
        });
        setShowFlashcardModal(true);
        break;
    }
  };

  const handleUpdate = async () => {
    try {
      if (!editingItem) return;

      switch (editingItem.type) {
        case 'subject':
          await updateSubject(editingItem.id, newSubject);
        await loadData();
          break;
        case 'topic':
          await updateTopic(editingItem.id, newTopic);
          if (selectedSubject) await loadTopics(selectedSubject.id);
          break;
        case 'flashcard':
          await updateFlashcard(editingItem.id, newFlashcard);
          if (selectedTopic) await loadFlashcards(selectedTopic.id);
          break;
      }

      setEditingItem(null);
      setShowSubjectModal(false);
      setShowTopicModal(false);
      setShowFlashcardModal(false);
      alert('Item atualizado com sucesso!');
      } catch (error: any) {
      console.error('Erro ao atualizar item:', error);
      alert(`Erro ao atualizar item: ${error.message}`);
    }
  };

  const handleDelete = async (id: string, type: 'subject' | 'topic' | 'subtopic' | 'flashcard') => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    try {
      switch (type) {
        case 'subject':
          await deleteSubject(id);
          await loadData();
          break;
        case 'topic':
          await deleteTopic(id);
          if (selectedSubject) await loadTopics(selectedSubject.id);
          break;
        case 'flashcard':
          await deleteFlashcard(id);
          if (selectedTopic) await loadFlashcards(selectedTopic.id);
          break;
      }

      alert('Item excluído com sucesso!');
    } catch (error: any) {
      console.error('Erro ao excluir item:', error);
      alert(`Erro ao excluir item: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados...</p>
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
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/admin')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Voltar
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Banco de Matérias</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Matérias */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <AcademicCapIcon className="w-6 h-6 mr-2" />
                  Matérias ({subjects.length})
                </h2>
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setNewSubject({
                      name: '',
                      description: '',
                      courseId: courseId,
                      order: 1,
                      isActive: true
                    });
                    setShowSubjectModal(true);
                  }}
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                {subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedSubject?.id === subject.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => handleSubjectSelect(subject)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{subject.name}</h3>
                      </div>
                      <div className="flex space-x-1 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(subject, 'subject');
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(subject.id, 'subject');
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tópicos */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <BookOpenIcon className="w-6 h-6 mr-2" />
                  Tópicos ({topics.length})
                </h2>
                {selectedSubject && (
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setNewTopic({
                        name: '',
                        subjectId: selectedSubject.id,
                        order: 1,
                        isActive: true
                      });
                      setShowTopicModal(true);
                    }}
                    className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700"
                  >
                    <PlusIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            <div className="p-6">
              {selectedSubject ? (
                <div className="space-y-2">
                  {topics.map((topic) => (
                    <div
                      key={topic.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedTopic?.id === topic.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                      onClick={() => handleTopicSelect(topic)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{topic.name}</h3>
                        </div>
                        <div className="flex space-x-1 ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(topic, 'topic');
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(topic.id, 'topic');
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center">Selecione uma matéria</p>
              )}
            </div>
          </div>

          {/* Flashcards */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <BookOpenIcon className="w-6 h-6 mr-2" />
                  Flashcards ({flashcards.length})
                </h2>
                {selectedTopic && (
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setNewFlashcard({
                        front: '',
                        back: '',
                        explanation: '',
                        topicId: selectedTopic.id,
                        order: 1,
                        isActive: true
                      });
                      setShowFlashcardModal(true);
                    }}
                    className="bg-orange-600 text-white p-2 rounded-lg hover:bg-orange-700"
                  >
                    <PlusIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            <div className="p-6">
              {selectedTopic ? (
                <div className="space-y-2">
                  {flashcards.map((flashcard) => (
                    <div
                      key={flashcard.id}
                      className="p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 text-sm">{flashcard.front}</h3>
                          <p className="text-xs text-gray-600 mt-1">{flashcard.back}</p>
                        </div>
                        <div className="flex space-x-1 ml-2">
                          <button
                            onClick={() => handleEdit(flashcard, 'flashcard')}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(flashcard.id, 'flashcard')}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center">Selecione um sub-tópico</p>
              )}
            </div>
          </div>
        </div>

        {/* Modals */}
        {/* Subject Modal */}
        {showSubjectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                {editingItem ? 'Editar Matéria' : 'Nova Matéria'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição *
                  </label>
                  <textarea
                    value={newSubject.description}
                    onChange={(e) => setNewSubject({...newSubject, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descreva o conteúdo desta matéria..."
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newSubject.isActive}
                      onChange={(e) => setNewSubject({...newSubject, isActive: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Ativo</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowSubjectModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={editingItem ? handleUpdate : handleCreateSubject}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingItem ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Topic Modal */}
        {showTopicModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                {editingItem ? 'Editar Tópico' : 'Novo Tópico'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={newTopic.name}
                    onChange={(e) => setNewTopic({...newTopic, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Matéria *
                  </label>
                  <select
                    value={newTopic.subjectId}
                    onChange={(e) => setNewTopic({...newTopic, subjectId: e.target.value})}
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

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newTopic.isActive}
                      onChange={(e) => setNewTopic({...newTopic, isActive: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Ativo</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowTopicModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={editingItem ? handleUpdate : handleCreateTopic}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  {editingItem ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </div>
          </div>
        )}



        {/* Flashcard Modal */}
        {showFlashcardModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                {editingItem ? 'Editar Flashcard' : 'Novo Flashcard'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pergunta *
                  </label>
                  <textarea
                    value={newFlashcard.front}
                    onChange={(e) => setNewFlashcard({...newFlashcard, front: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resposta *
                  </label>
                  <textarea
                    value={newFlashcard.back}
                    onChange={(e) => setNewFlashcard({...newFlashcard, back: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Explicação (opcional)
                  </label>
                  <textarea
                    value={newFlashcard.explanation}
                    onChange={(e) => setNewFlashcard({...newFlashcard, explanation: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newFlashcard.isActive}
                      onChange={(e) => setNewFlashcard({...newFlashcard, isActive: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Ativo</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowFlashcardModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={editingItem ? handleUpdate : handleCreateFlashcard}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  {editingItem ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 