'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { 
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  BookmarkIcon,
  EllipsisHorizontalIcon,
  ArrowLeftIcon,
  PaperAirplaneIcon,
  PhotoIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface Post {
  id: string;
  title: string;
  content: string;
  image?: string;
  video?: string;
  author: {
    name: string;
    avatar?: string;
    isAdmin: boolean;
  };
  createdAt: Date;
  likes: number;
  comments: Comment[];
  isLiked: boolean;
  isSaved: boolean;
}

interface Comment {
  id: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  isAdminReply?: boolean;
}

export default function FeedPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    image: '',
    video: ''
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Verificar se o usuário tem acesso ativo
    if (!user.isPaid && !user.isAdmin && !user.createdByAdmin) {
      toast.error('Você precisa ter acesso ativo para acessar o feed');
      router.push('/contact');
      return;
    }

    loadPosts();
  }, [user]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      
      // Feed vazio - será populado pelos administradores
      const mockPosts: Post[] = [];
      
      setPosts(mockPosts);
      setLoading(false);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Erro ao carregar posts');
      setLoading(false);
    }
  };

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !post.isLiked
        };
      }
      return post;
    }));
  };

  const handleSave = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isSaved: !post.isSaved
        };
      }
      return post;
    }));
  };

  const handleComment = (post: Post) => {
    setSelectedPost(post);
    setShowCommentModal(true);
  };

  const submitComment = () => {
    if (!newComment.trim() || !selectedPost) return;

    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment,
      author: {
        name: user?.displayName || user?.email || 'Usuário'
      },
      createdAt: new Date()
    };

    setPosts(prev => prev.map(post => {
      if (post.id === selectedPost.id) {
        return {
          ...post,
          comments: [...post.comments, comment]
        };
      }
      return post;
    }));

    setNewComment('');
    setShowCommentModal(false);
    setSelectedPost(null);
    toast.success('Comentário adicionado!');
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors touch-button"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Voltar</span>
            </button>
            
            <h1 className="text-lg font-bold text-gray-900">Feed Social</h1>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors touch-button"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Posts */}
        <div className="space-y-6">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Post Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {post.author.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{post.author.name}</div>
                      <div className="text-sm text-gray-500">{formatTimeAgo(post.createdAt)}</div>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 touch-button">
                    <EllipsisHorizontalIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Post Content */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-2">{post.title}</h3>
                <p className="text-gray-700 leading-relaxed">{post.content}</p>
                
                {post.image && (
                  <div className="mt-4">
                    <img 
                      src={post.image} 
                      alt="Post image" 
                      className="w-full rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* Post Actions */}
              <div className="px-4 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center space-x-1 transition-colors touch-button ${
                        post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                      }`}
                    >
                      {post.isLiked ? (
                        <HeartIconSolid className="w-5 h-5" />
                      ) : (
                        <HeartIcon className="w-5 h-5" />
                      )}
                      <span className="text-sm">{post.likes}</span>
                    </button>
                    
                    <button
                      onClick={() => handleComment(post)}
                      className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors touch-button"
                    >
                      <ChatBubbleLeftIcon className="w-5 h-5" />
                      <span className="text-sm">{post.comments.length}</span>
                    </button>
                    
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-green-500 transition-colors touch-button">
                      <ShareIcon className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => handleSave(post.id)}
                    className={`transition-colors touch-button ${
                      post.isSaved ? 'text-yellow-500' : 'text-gray-500 hover:text-yellow-500'
                    }`}
                  >
                    <BookmarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Comments Preview */}
              {post.comments.length > 0 && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <div className="pt-3 space-y-2">
                    {post.comments.slice(0, 2).map((comment) => (
                      <div key={comment.id} className="flex items-start space-x-2">
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-gray-600">
                            {comment.author.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {comment.author.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                    {post.comments.length > 2 && (
                      <button
                        onClick={() => handleComment(post)}
                        className="text-sm text-gray-500 hover:text-blue-500"
                      >
                        Ver todos os {post.comments.length} comentários
                      </button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {posts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <PaperAirplaneIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma postagem ainda
            </h3>
            <p className="text-gray-600 mb-6">
              Seja o primeiro a compartilhar algo interessante!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Criar Postagem
            </button>
          </div>
        )}
      </div>

      {/* Comment Modal */}
      <AnimatePresence>
        {showCommentModal && selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50"
            onClick={() => setShowCommentModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white rounded-t-xl sm:rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Comentários</h3>
                  <button
                    onClick={() => setShowCommentModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-4 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {selectedPost.comments.map((comment) => (
                    <div key={comment.id} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-gray-600">
                          {comment.author.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {comment.author.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Adicione um comentário..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onKeyPress={(e) => e.key === 'Enter' && submitComment()}
                  />
                  <button
                    onClick={submitComment}
                    disabled={!newComment.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Enviar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Nova Postagem</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Título da postagem"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                
                <textarea
                  placeholder="Conteúdo da postagem..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                
                <div className="flex space-x-2">
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <PhotoIcon className="w-5 h-5" />
                    <span>Imagem</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <VideoCameraIcon className="w-5 h-5" />
                    <span>Vídeo</span>
                  </button>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      // Aqui você implementaria a lógica para criar a postagem
                      toast.success('Postagem criada com sucesso!');
                      setShowCreateModal(false);
                      setNewPost({ title: '', content: '', image: '', video: '' });
                    }}
                    disabled={!newPost.title.trim() || !newPost.content.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Publicar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 