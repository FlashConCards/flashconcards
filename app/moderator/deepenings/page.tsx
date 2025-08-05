'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { 
  getDeepenings, 
  createDeepening, 
  updateDeepening, 
  deleteDeepening,
  getSubTopics
} from '@/lib/firebase';
import { Deepening, SubTopic } from '@/types';
import toast from 'react-hot-toast';
import RichTextEditor from '@/components/RichTextEditor';

export default function ModeratorDeepeningsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [deepenings, setDeepenings] = useState<Deepening[]>([]);
  const [subTopics, setSubTopics] = useState<SubTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDeepening, setSelectedDeepening] = useState<Deepening | null>(null);
  const [newDeepening, setNewDeepening] = useState({
    title: '',
    content: '',
    subTopicId: ''
  });
  const [editDeepening, setEditDeepening] = useState({
    title: '',
    content: '',
    subTopicId: ''
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
      const [deepeningsData, subTopicsData] = await Promise.all([
        getDeepenings(),
        getSubTopics()
      ]);
      setDeepenings(deepeningsData || []);
      setSubTopics(subTopicsData || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const handleAddDeepening = async () => {
    try {
      if (!newDeepening.title || !newDeepening.content || !newDeepening.subTopicId) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      await createDeepening({
        title: newDeepening.title,
        content: newDeepening.content,
        subTopicId: newDeepening.subTopicId
      });

      await loadData();
      setNewDeepening({ title: '', content: '', subTopicId: '' });
      setShowAddModal(false);
      toast.success('Aprofundamento adicionado com sucesso!');
    } catch (error: any) {
      console.error('Error adding deepening:', error);
      toast.error(`Erro ao adicionar aprofundamento: ${error.message}`);
    }
  };

  const handleEditDeepening = (deepening: Deepening) => {
    setSelectedDeepening(deepening);
    setEditDeepening({
      title: deepening.title,
      content: deepening.content,
      subTopicId: deepening.subTopicId
    });
    setShowEditModal(true);
  };

  const handleUpdateDeepening = async () => {
    if (!selectedDeepening) return;

    try {
      await updateDeepening(selectedDeepening.id, editDeepening);
      await loadData();
      setShowEditModal(false);
      setSelectedDeepening(null);
      toast.success('Aprofundamento atualizado com sucesso!');
    } catch (error: any) {
      console.error('Error updating deepening:', error);
      toast.error(`Erro ao atualizar aprofundamento: ${error.message}`);
    }
  };

  const handleDeleteDeepening = async (deepeningId: string) => {
    if (confirm('Tem certeza que deseja excluir este aprofundamento?')) {
      try {
        await deleteDeepening(deepeningId);
        await loadData();
        toast.success('Aprofundamento excluído com sucesso!');
      } catch (error: any) {
        console.error('Error deleting deepening:', error);
        toast.error(`Erro ao excluir aprofundamento: ${error.message}`);
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
              <h1 className="text-xl font-bold text-gray-900">Gerenciar Aprofundamentos</h1>
            </div>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Adicionar Aprofundamento</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Deepenings List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Aprofundamentos ({deepenings.length})</h2>
          </div>
          
          {deepenings.length === 0 ? (
            <div className="text-center py-12">
              <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Nenhum aprofundamento cadastrado ainda.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {deepenings.map((deepening) => {
                const subTopic = subTopics.find(st => st.id === deepening.subTopicId);
                return (
                  <div key={deepening.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{deepening.title}</h3>
                        <div 
                          className="text-sm text-gray-600 mt-1 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: deepening.content.substring(0, 200) + '...' }}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Subtópico: {subTopic?.name || 'N/A'}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleEditDeepening(deepening)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDeepening(deepening.id)}
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

      {/* Add Deepening Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Adicionar Aprofundamento</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={newDeepening.title}
                  onChange={(e) => setNewDeepening({...newDeepening, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Título do aprofundamento"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtópico *
                </label>
                <select
                  value={newDeepening.subTopicId}
                  onChange={(e) => setNewDeepening({...newDeepening, subTopicId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="">Selecione um subtópico</option>
                  {subTopics.map((subTopic) => (
                    <option key={subTopic.id} value={subTopic.id}>
                      {subTopic.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conteúdo *
                </label>
                <RichTextEditor
                  value={newDeepening.content}
                  onChange={(content) => setNewDeepening({...newDeepening, content})}
                />
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
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Deepening Modal */}
      {showEditModal && selectedDeepening && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Editar Aprofundamento</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={editDeepening.title}
                  onChange={(e) => setEditDeepening({...editDeepening, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtópico
                </label>
                <select
                  value={editDeepening.subTopicId}
                  onChange={(e) => setEditDeepening({...editDeepening, subTopicId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="">Selecione um subtópico</option>
                  {subTopics.map((subTopic) => (
                    <option key={subTopic.id} value={subTopic.id}>
                      {subTopic.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conteúdo
                </label>
                <RichTextEditor
                  value={editDeepening.content}
                  onChange={(content) => setEditDeepening({...editDeepening, content})}
                />
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
                onClick={handleUpdateDeepening}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
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