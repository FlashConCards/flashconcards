'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ArrowLeftIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { 
  getTopics, 
  createTopic, 
  updateTopic, 
  deleteTopic,
  getSubjects
} from '@/lib/firebase';
import { Topic, Subject } from '@/types';
import toast from 'react-hot-toast';

export default function ModeratorTopicsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [newTopic, setNewTopic] = useState({
    name: '',
    subjectId: ''
  });
  const [editTopic, setEditTopic] = useState({
    name: '',
    subjectId: ''
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
      const [topicsData, subjectsData] = await Promise.all([
        getTopics(),
        getSubjects()
      ]);
      setTopics(topicsData || []);
      setSubjects(subjectsData || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const handleAddTopic = async () => {
    try {
      if (!newTopic.name || !newTopic.subjectId) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      await createTopic({
        name: newTopic.name,
        subjectId: newTopic.subjectId
      });

      await loadData();
      setNewTopic({ name: '', subjectId: '' });
      setShowAddModal(false);
      toast.success('Tópico adicionado com sucesso!');
    } catch (error: any) {
      console.error('Error adding topic:', error);
      toast.error(`Erro ao adicionar tópico: ${error.message}`);
    }
  };

  const handleEditTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    setEditTopic({
      name: topic.name,
      subjectId: topic.subjectId
    });
    setShowEditModal(true);
  };

  const handleUpdateTopic = async () => {
    if (!selectedTopic) return;

    try {
      await updateTopic(selectedTopic.id, editTopic);
      await loadData();
      setShowEditModal(false);
      setSelectedTopic(null);
      toast.success('Tópico atualizado com sucesso!');
    } catch (error: any) {
      console.error('Error updating topic:', error);
      toast.error(`Erro ao atualizar tópico: ${error.message}`);
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (confirm('Tem certeza que deseja excluir este tópico?')) {
      try {
        await deleteTopic(topicId);
        await loadData();
        toast.success('Tópico excluído com sucesso!');
      } catch (error: any) {
        console.error('Error deleting topic:', error);
        toast.error(`Erro ao excluir tópico: ${error.message}`);
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
              <h1 className="text-xl font-bold text-gray-900">Gerenciar Tópicos</h1>
            </div>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Adicionar Tópico</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Topics List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Tópicos ({topics.length})</h2>
          </div>
          
          {topics.length === 0 ? (
            <div className="text-center py-12">
              <AcademicCapIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Nenhum tópico cadastrado ainda.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {topics.map((topic) => {
                const subject = subjects.find(s => s.id === topic.subjectId);
                return (
                  <div key={topic.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{topic.name}</h3>
                        <p className="text-xs text-gray-500 mt-2">
                          Matéria: {subject?.name || 'N/A'}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleEditTopic(topic)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTopic(topic.id)}
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

      {/* Add Topic Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Adicionar Tópico</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={newTopic.name}
                  onChange={(e) => setNewTopic({...newTopic, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Nome do tópico"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Matéria *
                </label>
                <select
                  value={newTopic.subjectId}
                  onChange={(e) => setNewTopic({...newTopic, subjectId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Selecione uma matéria</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
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
                onClick={handleAddTopic}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Topic Modal */}
      {showEditModal && selectedTopic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Editar Tópico</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={editTopic.name}
                  onChange={(e) => setEditTopic({...editTopic, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Matéria
                </label>
                <select
                  value={editTopic.subjectId}
                  onChange={(e) => setEditTopic({...editTopic, subjectId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Selecione uma matéria</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
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
                onClick={handleUpdateTopic}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
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