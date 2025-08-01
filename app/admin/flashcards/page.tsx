'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCourses, getSubjects, getTopics, getSubTopics, getFlashcards, createFlashcard, deleteFlashcard } from '@/lib/firebase';

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

interface Flashcard {
  id: string;
  subTopicId: string;
  front?: string;
  back?: string;
  question?: string;
  answer?: string;
  explanation?: string;
  order: number;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

export default function FlashcardsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const subTopicId = searchParams.get('subTopicId');
  const topicId = searchParams.get('topicId');
  const subjectId = searchParams.get('subjectId');
  const courseId = searchParams.get('courseId');
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subTopics, setSubTopics] = useState<SubTopic[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedSubTopic, setSelectedSubTopic] = useState<SubTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFlashcard, setNewFlashcard] = useState({
    front: '',
    back: '',
    explanation: '',
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
                  
                  if (subTopicId) {
                    const subTopic = subTopicsData?.find(st => st.id === subTopicId);
                    setSelectedSubTopic(subTopic || null);
                    
                    if (subTopic) {
                      const flashcardsData = await getFlashcards(subTopicId);
                      console.log('Flashcards loaded:', flashcardsData);
                      console.log('First flashcard details:', flashcardsData[0]);
                      console.log('subTopicId being used:', subTopicId);
                      console.log('All flashcards data:', JSON.stringify(flashcardsData, null, 2));
                      setFlashcards(flashcardsData || []);
                    }
                  }
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
  }, [user, courseId, subjectId, topicId, subTopicId]);

  const handleAddFlashcard = async () => {
    try {
      if (!selectedSubTopic || !newFlashcard.front || !newFlashcard.back) {
        alert('Preencha todos os campos obrigatórios');
        return;
      }

      console.log('Creating flashcard with data:', {
        front: newFlashcard.front,
        back: newFlashcard.back,
        explanation: newFlashcard.explanation,
        order: newFlashcard.order,
        subTopicId: selectedSubTopic.id,
        isActive: true
      });

      const flashcardData = {
        front: newFlashcard.front.trim(),
        back: newFlashcard.back.trim(),
        explanation: newFlashcard.explanation.trim(),
        order: newFlashcard.order,
        subTopicId: selectedSubTopic.id,
        isActive: true
      };
      
      // Verificar se os dados estão corretos antes de salvar
      if (!flashcardData.front || flashcardData.front.length === 0) {
        alert('A pergunta não pode estar vazia');
        return;
      }
      
      if (!flashcardData.back || flashcardData.back.length === 0) {
        alert('A resposta não pode estar vazia');
        return;
      }
      
      // Verificar se os dados estão sendo passados corretamente
      console.log('Flashcard data before save:', {
        front: flashcardData.front,
        back: flashcardData.back,
        explanation: flashcardData.explanation,
        order: flashcardData.order,
        subTopicId: flashcardData.subTopicId,
        isActive: flashcardData.isActive
      });

      console.log('Flashcard data to save:', flashcardData);

      await createFlashcard(flashcardData);
      await loadData();
      
      setNewFlashcard({ front: '', back: '', explanation: '', order: 1 });
      setShowAddModal(false);
      alert('Flashcard criado com sucesso!');
    } catch (error: any) {
      console.error('Error creating flashcard:', error);
      alert(`Erro ao criar flashcard: ${error.message}`);
    }
  };

  const handleDeleteFlashcard = async (flashcardId: string) => {
    if (confirm('Tem certeza que deseja excluir este flashcard?')) {
      try {
        await deleteFlashcard(flashcardId);
        await loadData();
        alert('Flashcard excluído com sucesso!');
      } catch (error: any) {
        console.error('Error deleting flashcard:', error);
        alert(`Erro ao excluir flashcard: ${error.message}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando flashcards...</p>
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
            <h1 className="text-3xl font-bold text-gray-800">Gerenciar Flashcards</h1>
            {selectedCourse && selectedSubject && selectedTopic && selectedSubTopic && (
              <p className="text-gray-600 mt-2">
                Curso: {selectedCourse.name} → Matéria: {selectedSubject.name} → Tópico: {selectedTopic.name} → Sub-tópico: {selectedSubTopic.name}
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
            {selectedSubTopic && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Adicionar Flashcard
              </button>
            )}
          </div>
        </div>

        {/* Course/Subject/Topic/SubTopic Selection */}
        {(!selectedCourse || !selectedSubject || !selectedTopic || !selectedSubTopic) && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Selecionar Curso, Matéria, Tópico e Sub-tópico</h2>
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

        {/* Flashcards List */}
        {selectedCourse && selectedSubject && selectedTopic && selectedSubTopic && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Flashcards ({flashcards.length})</h2>
          </div>
            <div className="p-6">
              {flashcards.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum flashcard cadastrado ainda.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {flashcards.map((flashcard) => {
                    console.log('Rendering flashcard:', flashcard);
                    console.log('Flashcard front:', flashcard.front);
                    console.log('Flashcard back:', flashcard.back);
                    console.log('Flashcard question:', flashcard.question);
                    console.log('Flashcard answer:', flashcard.answer);
                    
                    // Verificar se os campos estão vazios
                    if (!flashcard.front && !flashcard.question) {
                      console.error('Flashcard sem pergunta:', flashcard);
                    }
                    if (!flashcard.back && !flashcard.answer) {
                      console.error('Flashcard sem resposta:', flashcard);
                    }
                    
                    // Verificar se os campos estão sendo exibidos corretamente
                    console.log('Flashcard display check:', {
                      id: flashcard.id,
                      hasFront: !!flashcard.front,
                      hasBack: !!flashcard.back,
                      hasQuestion: !!flashcard.question,
                      hasAnswer: !!flashcard.answer,
                      frontLength: flashcard.front?.length || 0,
                      backLength: flashcard.back?.length || 0,
                      frontValue: flashcard.front,
                      backValue: flashcard.back,
                      frontType: typeof flashcard.front,
                      backType: typeof flashcard.back,
                      allFields: Object.keys(flashcard),
                      flashcardKeys: Object.keys(flashcard),
                      flashcardValues: Object.values(flashcard),
                      flashcardEntries: Object.entries(flashcard),
                      flashcardStringified: JSON.stringify(flashcard, null, 2),
                      flashcardRaw: flashcard,
                      flashcardNull: flashcard === null,
                      flashcardUndefined: flashcard === undefined,
                      flashcardEmpty: Object.keys(flashcard).length === 0,
                      flashcardHasSubTopicId: !!flashcard.subTopicId,
                      flashcardHasFront: !!flashcard.front,
                      flashcardHasBack: !!flashcard.back,
                      flashcardFrontEmpty: flashcard.front === '',
                      flashcardBackEmpty: flashcard.back === '',
                      flashcardFrontNull: flashcard.front === null,
                      flashcardBackNull: flashcard.back === null,
                      flashcardFrontUndefined: flashcard.front === undefined,
                      flashcardBackUndefined: flashcard.back === undefined,
                      flashcardFrontTruthy: !!flashcard.front,
                      flashcardBackTruthy: !!flashcard.back,
                      flashcardFrontLength: flashcard.front?.length || 0,
                      flashcardBackLength: flashcard.back?.length || 0,
                      flashcardFrontString: String(flashcard.front),
                      flashcardBackString: String(flashcard.back),
                      flashcardFrontTrimmed: flashcard.front?.trim(),
                      flashcardBackTrimmed: flashcard.back?.trim(),
                      flashcardFrontTrimmedLength: flashcard.front?.trim()?.length || 0,
                      flashcardBackTrimmedLength: flashcard.back?.trim()?.length || 0,
                      flashcardFrontTrimmedTruthy: !!flashcard.front?.trim(),
                      flashcardBackTrimmedTruthy: !!flashcard.back?.trim(),
                      flashcardFrontTrimmedEmpty: flashcard.front?.trim() === '',
                      flashcardBackTrimmedEmpty: flashcard.back?.trim() === ''
                    });
                    
                    return (
                      <div key={flashcard.id} className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition-shadow">
                        <div className="mb-4">
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Pergunta:</h3>
                          <p className="text-gray-800 font-medium min-h-[3rem]">
                            {flashcard.front || flashcard.question || 'Pergunta não definida'}
                          </p>
                          {(!flashcard.front && !flashcard.question) && (
                            <p className="text-red-500 text-xs mt-1">⚠️ Campo vazio no banco de dados</p>
                          )}
                        </div>
                        <div className="mb-4">
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Resposta:</h3>
                          <p className="text-gray-800 min-h-[3rem]">
                            {flashcard.back || flashcard.answer || 'Resposta não definida'}
                          </p>
                          {(!flashcard.back && !flashcard.answer) && (
                            <p className="text-red-500 text-xs mt-1">⚠️ Campo vazio no banco de dados</p>
                          )}
                        </div>
                        {flashcard.explanation && (
                          <div className="mb-4">
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Explicação:</h3>
                            <p className="text-gray-600 text-sm min-h-[2rem]">
                              {flashcard.explanation}
                            </p>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Ordem: {flashcard.order}</span>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => router.push(`/admin/deepening?courseId=${courseId}&subjectId=${subjectId}&topicId=${topicId}&subTopicId=${subTopicId}&flashcardId=${flashcard.id}`)}
                              className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200 transition-colors"
                            >
                              Aprofundamento
                            </button>
                            <button
                              onClick={() => handleDeleteFlashcard(flashcard.id)}
                              className="text-xs bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 transition-colors"
                            >
                              Excluir
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
        )}

        {/* Add Flashcard Modal */}
        {showAddModal && selectedSubTopic && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Adicionar Flashcard</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pergunta *
                  </label>
                  <textarea
                    value={newFlashcard.front}
                    onChange={(e) => setNewFlashcard({...newFlashcard, front: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Digite a pergunta do flashcard"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resposta *
                  </label>
                  <textarea
                    value={newFlashcard.back}
                    onChange={(e) => setNewFlashcard({...newFlashcard, back: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Digite a resposta do flashcard"
                  />
                </div>
                
                                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Explicação
                    </label>
                    <textarea
                      value={newFlashcard.explanation}
                      onChange={(e) => setNewFlashcard({...newFlashcard, explanation: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Digite uma explicação opcional"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ordem
                    </label>
                    <input
                      type="number"
                      value={newFlashcard.order}
                      onChange={(e) => setNewFlashcard({...newFlashcard, order: parseInt(e.target.value) || 1})}
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
                  onClick={handleAddFlashcard}
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