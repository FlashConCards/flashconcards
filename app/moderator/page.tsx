'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { 
  BookOpenIcon, 
  AcademicCapIcon, 
  DocumentTextIcon,
  PlusIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ArrowLeftIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { 
  getSubjects, 
  createSubject, 
  updateSubject, 
  deleteSubject,
  getTopics,
  createTopic,
  updateTopic,
  deleteTopic,
  getFlashcards,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
  getDeepenings,
  createDeepening,
  updateDeepening,
  deleteDeepening,
  createPost,
  updateUserPhoto
} from '@/lib/firebase';
import { Subject, Topic, Flashcard, Deepening } from '@/types';
import toast from 'react-hot-toast';
import CreatePostModal from '@/components/admin/CreatePostModal';

export default function ModeratorPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [deepenings, setDeepenings] = useState<Deepening[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');

  useEffect(() => {
    console.log('Moderator page - User data:', user);
    console.log('Moderator page - isModerator:', user?.isModerator);
    console.log('Moderator page - isAdmin:', user?.isAdmin);
    
    if (!user) {
      console.log('Moderator page - No user, redirecting to login');
      router.push('/login');
      return;
    }

    if (!user.isModerator && !user.isAdmin) {
      console.log('Moderator page - User is not moderator or admin, redirecting to dashboard');
      router.push('/dashboard');
      return;
    }

    console.log('Moderator page - User is authorized, loading data');
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const subjectsData = await getSubjects();
      setSubjects(subjectsData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const handleCreatePost = async (postData: { content: string; image?: File }) => {
    try {
      if (!user) {
        toast.error('Usuário não encontrado');
        return;
      }

      await createPost({
        content: postData.content,
        image: postData.image,
        authorId: user.uid,
        authorName: user.displayName || 'Moderador',
        authorEmail: user.email,
        authorPhotoURL: user.photoURL,
        authorRole: 'moderator',
        isOfficial: false
      });

      toast.success('Post criado com sucesso!');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Erro ao criar post');
    }
  };

  const handleUpdatePhoto = async (file: File) => {
    try {
      if (!user?.uid) return;
      
      await updateUserPhoto(user.uid, file);
      toast.success('Foto de perfil atualizada!');
      window.location.reload();
    } catch (error) {
      console.error('Error updating photo:', error);
      toast.error('Erro ao atualizar foto');
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
                onClick={() => router.push('/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Voltar ao Dashboard</span>
              </button>
              <h1 className="text-xl font-bold text-gray-900">Painel do Moderador</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  {user?.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'Moderador'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {(user?.displayName || 'M').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-sm text-gray-700 hidden sm:inline">
                  {user?.displayName || 'Moderador'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <BookOpenIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Matérias</p>
                <p className="text-2xl font-bold text-gray-900">{subjects.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <AcademicCapIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tópicos</p>
                <p className="text-2xl font-bold text-gray-900">{topics.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <DocumentTextIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Flashcards</p>
                <p className="text-2xl font-bold text-gray-900">{flashcards.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aprofundamentos</p>
                <p className="text-2xl font-bold text-gray-900">{deepenings.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => router.push('/moderator/subjects')}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-blue-100">
                <BookOpenIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900">Gerenciar Matérias</h3>
                <p className="text-sm text-gray-600">Adicionar, editar e remover matérias</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/moderator/topics')}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-green-100">
                <AcademicCapIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900">Gerenciar Tópicos</h3>
                <p className="text-sm text-gray-600">Adicionar, editar e remover tópicos</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/moderator/flashcards')}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-purple-100">
                <DocumentTextIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900">Gerenciar Flashcards</h3>
                <p className="text-sm text-gray-600">Adicionar, editar e remover flashcards</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/moderator/deepenings')}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-yellow-100">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900">Gerenciar Aprofundamentos</h3>
                <p className="text-sm text-gray-600">Adicionar, editar e remover aprofundamentos</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setShowCreatePostModal(true)}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-red-100">
                <PlusIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900">Criar Post</h3>
                <p className="text-sm text-gray-600">Publicar no feed social</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => document.getElementById('photo-upload')?.click()}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-indigo-100">
                <PhotoIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900">Alterar Foto</h3>
                <p className="text-sm text-gray-600">Atualizar foto de perfil</p>
              </div>
            </div>
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Atividade Recente</h2>
          <div className="text-center text-gray-500 py-8">
            <UserGroupIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Nenhuma atividade recente</p>
          </div>
        </div>
      </div>

      {/* Hidden file input for photo upload */}
      <input
        id="photo-upload"
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleUpdatePhoto(file);
          }
        }}
        className="hidden"
      />

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
        onSubmit={handleCreatePost}
      />
    </div>
  );
} 