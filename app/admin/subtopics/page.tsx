'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCourses, getSubjects, getTopics, getSubTopics, createSubTopic, deleteSubTopic } from '@/lib/firebase';

interface Course {
  id: string;
  name: string;
  description: string;
  price: number;
  createdAt: any;
}

interface Subject {
  id: string;
  courseId: string;
  name: string;
  description: string;
  order: number;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

interface Topic {
  id: string;
  subjectId: string;
  name: string;
  description: string;
  order: number;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

interface SubTopic {
  id: string;
  topicId: string;
  name: string;
  description: string;
  order: number;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

export default function SubTopicsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const topicId = searchParams.get('topicId');
  const subjectId = searchParams.get('subjectId');
  const courseId = searchParams.get('courseId');
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subTopics, setSubTopics] = useState<SubTopic[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubTopic, setNewSubTopic] = useState({
    name: '',
    description: '',
    order: 1
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
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.isAdmin) {
      loadData();
    }
  }, [user, courseId, subjectId, topicId]);

  const handleAddSubTopic = async () => {
    try {
      if (!selectedTopic || !newSubTopic.name || !newSubTopic.description) {
        alert('Preencha todos os campos obrigatórios');
        return;
      }

      const subTopicData = {
        ...newSubTopic,
        topicId: selectedTopic.id,
        isActive: true
      };

      await createSubTopic(subTopicData);
      await loadData();
      
      setNewSubTopic({ name: '', description: '', order: 1 });
      setShowAddModal(false);
      alert('Sub-tópico criado com sucesso!');
    } catch (error: any) {
      console.error('Error creating sub-topic:', error);
      alert(`Erro ao criar sub-tópico: ${error.message}`);
    }
  };

  const handleDeleteSubTopic = async (subTopicId: string) => {
    if (confirm('Tem certeza que deseja excluir este sub-tópico?')) {
      try {
        await deleteSubTopic(subTopicId);
        await loadData();
        alert('Sub-tópico excluído com sucesso!');
      } catch (error: any) {
        console.error('Error deleting sub-topic:', error);
        alert(`Erro ao excluir sub-tópico: ${error.message}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando sub-tópicos...</p>
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
            <h1 className="text-3xl font-bold text-gray-800">Gerenciar Sub-tópicos</h1>
            {selectedCourse && selectedSubject && selectedTopic && (
              <p className="text-gray-600 mt-2">
                Curso: {selectedCourse.name} → Matéria: {selectedSubject.name} → Tópico: {selectedTopic.name}
              </p>
            )}
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => router.push('/admin')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Voltar ao Admin
            </button>
            {selectedTopic && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Adicionar Sub-tópico
              </button>
            )}
          </div>
        </div>

        {/* Course/Subject/Topic Selection */}
        {(!selectedCourse || !selectedSubject || !selectedTopic) && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Selecionar Curso, Matéria e Tópico</h2>
            </div>
            <div className="p-6">
              {courses.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum curso disponível.</p>
              ) : (
                <div className="space-y-4">
                  {courses.map((course) => (
                    <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-800 mb-2">{course.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                      <button
                        onClick={() => router.push(`/admin/subjects?courseId=${course.id}`)}
                        className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200"
                      >
                        Ver Matérias
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sub-topics List */}
        {selectedCourse && selectedSubject && selectedTopic && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Sub-tópicos ({subTopics.length})</h2>
            </div>
            <div className="p-6">
              {subTopics.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum sub-tópico cadastrado ainda.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subTopics.map((subTopic) => (
                    <div key={subTopic.id} className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{subTopic.name}</h3>
                      <p className="text-gray-600 mb-4">{subTopic.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Ordem: {subTopic.order}</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => router.push(`/admin/flashcards?subTopicId=${subTopic.id}&topicId=${selectedTopic.id}&subjectId=${selectedSubject.id}&courseId=${selectedCourse.id}`)}
                            className="text-xs bg-orange-100 text-orange-800 px-3 py-1 rounded hover:bg-orange-200"
                          >
                            Flashcards
                          </button>
                          <button
                            onClick={() => handleDeleteSubTopic(subTopic.id)}
                            className="text-xs bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200"
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

        {/* Add Sub-topic Modal */}
        {showAddModal && selectedTopic && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Adicionar Sub-tópico</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Sub-tópico *
                  </label>
                  <input
                    type="text"
                    value={newSubTopic.name}
                    onChange={(e) => setNewSubTopic({...newSubTopic, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome do sub-tópico"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição *
                  </label>
                  <textarea
                    value={newSubTopic.description}
                    onChange={(e) => setNewSubTopic({...newSubTopic, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Descrição do sub-tópico"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ordem
                  </label>
                  <input
                    type="number"
                    value={newSubTopic.order}
                    onChange={(e) => setNewSubTopic({...newSubTopic, order: parseInt(e.target.value) || 1})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1"
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
                  onClick={handleAddSubTopic}
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