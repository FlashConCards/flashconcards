'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ArrowLeftIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { 
  getSubjects, 
  createSubject, 
  updateSubject, 
  deleteSubject,
  getCourses
} from '@/lib/firebase';
import { Subject, Course } from '@/types';
import toast from 'react-hot-toast';

export default function ModeratorSubjectsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [newSubject, setNewSubject] = useState({
    name: '',
    description: '',
    courseId: ''
  });
  const [editSubject, setEditSubject] = useState({
    name: '',
    description: '',
    courseId: ''
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
      const [subjectsData, coursesData] = await Promise.all([
        getSubjects(),
        getCourses()
      ]);
      setSubjects(subjectsData || []);
      setCourses(coursesData || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const handleAddSubject = async () => {
    try {
      if (!newSubject.name || !newSubject.description || !newSubject.courseId) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      await createSubject({
        name: newSubject.name,
        description: newSubject.description,
        courseId: newSubject.courseId
      });

      await loadData();
      setNewSubject({ name: '', description: '', courseId: '' });
      setShowAddModal(false);
      toast.success('Matéria adicionada com sucesso!');
    } catch (error: any) {
      console.error('Error adding subject:', error);
      toast.error(`Erro ao adicionar matéria: ${error.message}`);
    }
  };

  const handleEditSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setEditSubject({
      name: subject.name,
      description: subject.description,
      courseId: subject.courseId
    });
    setShowEditModal(true);
  };

  const handleUpdateSubject = async () => {
    if (!selectedSubject) return;

    try {
      await updateSubject(selectedSubject.id, editSubject);
      await loadData();
      setShowEditModal(false);
      setSelectedSubject(null);
      toast.success('Matéria atualizada com sucesso!');
    } catch (error: any) {
      console.error('Error updating subject:', error);
      toast.error(`Erro ao atualizar matéria: ${error.message}`);
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (confirm('Tem certeza que deseja excluir esta matéria?')) {
      try {
        await deleteSubject(subjectId);
        await loadData();
        toast.success('Matéria excluída com sucesso!');
      } catch (error: any) {
        console.error('Error deleting subject:', error);
        toast.error(`Erro ao excluir matéria: ${error.message}`);
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
              <h1 className="text-xl font-bold text-gray-900">Gerenciar Matérias</h1>
            </div>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Adicionar Matéria</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subjects List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Matérias ({subjects.length})</h2>
          </div>
          
          {subjects.length === 0 ? (
            <div className="text-center py-12">
              <BookOpenIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Nenhuma matéria cadastrada ainda.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {subjects.map((subject) => {
                const course = courses.find(c => c.id === subject.courseId);
                return (
                  <div key={subject.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{subject.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{subject.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Curso: {course?.name || 'N/A'}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleEditSubject(subject)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubject(subject.id)}
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

      {/* Add Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Adicionar Matéria</h3>
            
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
                  placeholder="Nome da matéria"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição *
                </label>
                <textarea
                  value={newSubject.description}
                  onChange={(e) => setNewSubject({...newSubject, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descrição da matéria"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Curso *
                </label>
                <select
                  value={newSubject.courseId}
                  onChange={(e) => setNewSubject({...newSubject, courseId: e.target.value})}
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
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddSubject}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {showEditModal && selectedSubject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Editar Matéria</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={editSubject.name}
                  onChange={(e) => setEditSubject({...editSubject, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={editSubject.description}
                  onChange={(e) => setEditSubject({...editSubject, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Curso
                </label>
                <select
                  value={editSubject.courseId}
                  onChange={(e) => setEditSubject({...editSubject, courseId: e.target.value})}
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
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateSubject}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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