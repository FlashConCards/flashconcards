'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCourses, getSubjects, createSubject, deleteSubject } from '@/lib/firebase';

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

export default function SubjectsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubject, setNewSubject] = useState({
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
  }, [user, courseId]);

  const handleAddSubject = async () => {
    try {
      if (!selectedCourse || !newSubject.name || !newSubject.description) {
        alert('Preencha todos os campos obrigatórios');
        return;
      }

      const subjectData = {
        ...newSubject,
        courseId: selectedCourse.id,
        isActive: true
      };

      await createSubject(subjectData);
      await loadData();
      
      setNewSubject({ name: '', description: '', order: 1 });
      setShowAddModal(false);
      alert('Matéria criada com sucesso!');
    } catch (error: any) {
      console.error('Error creating subject:', error);
      alert(`Erro ao criar matéria: ${error.message}`);
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (confirm('Tem certeza que deseja excluir esta matéria?')) {
      try {
        await deleteSubject(subjectId);
        await loadData();
        alert('Matéria excluída com sucesso!');
      } catch (error: any) {
        console.error('Error deleting subject:', error);
        alert(`Erro ao excluir matéria: ${error.message}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando matérias...</p>
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
            <h1 className="text-3xl font-bold text-gray-800">Gerenciar Matérias</h1>
            {selectedCourse && (
              <p className="text-gray-600 mt-2">Curso: {selectedCourse.name}</p>
            )}
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => router.push('/admin')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Voltar ao Admin
            </button>
            {selectedCourse && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Adicionar Matéria
              </button>
            )}
          </div>
        </div>

        {/* Course Selection */}
        {!selectedCourse && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Selecionar Curso</h2>
            </div>
            <div className="p-6">
              {courses.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum curso disponível.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.map((course) => (
                    <div key={course.id} className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50" onClick={() => router.push(`/admin/subjects?courseId=${course.id}`)}>
                      <h3 className="font-semibold text-gray-800">{course.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Subjects List */}
        {selectedCourse && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Matérias ({subjects.length})</h2>
            </div>
            <div className="p-6">
              {subjects.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhuma matéria cadastrada ainda.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subjects.map((subject) => (
                    <div key={subject.id} className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{subject.name}</h3>
                      <p className="text-gray-600 mb-4">{subject.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Ordem: {subject.order}</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => router.push(`/admin/topics?subjectId=${subject.id}&courseId=${selectedCourse.id}`)}
                            className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200"
                          >
                            Tópicos
                          </button>
                          <button
                            onClick={() => handleDeleteSubject(subject.id)}
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

        {/* Add Subject Modal */}
        {showAddModal && selectedCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Adicionar Matéria</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Matéria *
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
                    rows={3}
                    placeholder="Descrição da matéria"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ordem
                  </label>
                  <input
                    type="number"
                    value={newSubject.order}
                    onChange={(e) => setNewSubject({...newSubject, order: parseInt(e.target.value) || 1})}
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
                  onClick={handleAddSubject}
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