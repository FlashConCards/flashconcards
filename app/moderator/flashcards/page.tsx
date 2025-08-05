'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ArrowLeftIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { 
  getFlashcards, 
  createFlashcard, 
  updateFlashcard, 
  deleteFlashcard,
  getTopics
} from '@/lib/firebase';
import { Flashcard, Topic } from '@/types';
import toast from 'react-hot-toast';

export default function ModeratorFlashcardsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFlashcard, setSelectedFlashcard] = useState<Flashcard | null>(null);
  const [newFlashcard, setNewFlashcard] = useState({
    question: '',
    answer: '',
    topicId: ''
  });
  const [editFlashcard, setEditFlashcard] = useState({
    question: '',
    answer: '',
    topicId: ''
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!user.isModerator && !user.isAdmin) {
      router.push('/dashboard');
      return;
    }

    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [flashcardsData, topicsData] = await Promise.all([
        getFlashcards(),
        getTopics()
      ]);
      setFlashcards(flashcardsData || []);
      setTopics(topicsData || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const handleAddFlashcard = async () => {
    try {
      if (!newFlashcard.question || !newFlashcard.answer || !newFlashcard.topicId) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      await createFlashcard({
        question: newFlashcard.question,
        answer: newFlashcard.answer,
        topicId: newFlashcard.topicId
      });

      await loadData();
      setNewFlashcard({ question: '', answer: '', topicId: '' });
      setShowAddModal(false);
      toast.success('Flashcard adicionado com sucesso!');
    } catch (error: any) {
      console.error('Error adding flashcard:', error);
      toast.error(`Erro ao adicionar flashcard: ${error.message}`);
    }
  };

  const handleEditFlashcard = (flashcard: Flashcard) => {
    setSelectedFlashcard(flashcard);
    setEditFlashcard({
      question: flashcard.question,
      answer: flashcard.answer,
      topicId: flashcard.topicId
    });
    setShowEditModal(true);
  };

  const handleUpdateFlashcard = async () => {
    if (!selectedFlashcard) return;

    try {
      await updateFlashcard(selectedFlashcard.id, editFlashcard);
      await loadData();
      setShowEditModal(false);
      setSelectedFlashcard(null);
      toast.success('Flashcard atualizado com sucesso!');
    } catch (error: any) {
      console.error('Error updating flashcard:', error);
      toast.error(`Erro ao atualizar flashcard: ${error.message}`);
    }
  };

  const handleDeleteFlashcard = async (flashcardId: string) => {
    if (confirm('Tem certeza que deseja excluir este flashcard?')) {
      try {
        await deleteFlashcard(flashcardId);
        await loadData();
        toast.success('Flashcard excluído com sucesso!');
      } catch (error: any) {
        console.error('Error deleting flashcard:', error);
        toast.error(`Erro ao excluir flashcard: ${error.message}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/moderator')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Voltar ao Painel</span>
              </button>
              <h1 className="text-xl font-bold text-gray-900">Gerenciar Flashcards</h1>
            </div>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Adicionar Flashcard</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Flashcards List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Flashcards ({flashcards.length})</h2>
          </div>
          
          {flashcards.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Nenhum flashcard cadastrado ainda.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {flashcards.map((flashcard) => {
                const topic = topics.find(t => t.id === flashcard.topicId);
                return (
                  <div key={flashcard.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">Pergunta</h3>
                        <p className="text-sm text-gray-600 mt-1">{flashcard.question}</p>
                        <h4 className="text-md font-medium text-gray-900 mt-3">Resposta</h4>
                        <p className="text-sm text-gray-600 mt-1">{flashcard.answer}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Tópico: {topic?.name || 'N/A'}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleEditFlashcard(flashcard)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFlashcard(flashcard.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Flashcard Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Adicionar Flashcard</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pergunta *
                </label>
                <textarea
                  value={newFlashcard.question}
                  onChange={(e) => setNewFlashcard({...newFlashcard, question: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Digite a pergunta"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resposta *
                </label>
                <textarea
                  value={newFlashcard.answer}
                  onChange={(e) => setNewFlashcard({...newFlashcard, answer: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Digite a resposta"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tópico *
                </label>
                <select
                  value={newFlashcard.topicId}
                  onChange={(e) => setNewFlashcard({...newFlashcard, topicId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Selecione um tópico</option>
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
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
                onClick={handleAddFlashcard}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Flashcard Modal */}
      {showEditModal && selectedFlashcard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Editar Flashcard</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pergunta
                </label>
                <textarea
                  value={editFlashcard.question}
                  onChange={(e) => setEditFlashcard({...editFlashcard, question: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resposta
                </label>
                <textarea
                  value={editFlashcard.answer}
                  onChange={(e) => setEditFlashcard({...editFlashcard, answer: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tópico
                </label>
                <select
                  value={editFlashcard.topicId}
                  onChange={(e) => setEditFlashcard({...editFlashcard, topicId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Selecione um tópico</option>
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateFlashcard}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Atualizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 