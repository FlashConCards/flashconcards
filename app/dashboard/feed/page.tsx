'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { 
  HeartIcon, 
  ChatBubbleLeftIcon, 
  PaperAirplaneIcon,
  UserCircleIcon,
  ArrowLeftIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

interface Post {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: any;
  likes: string[];
  comments: Comment[];
  image?: string;
}

interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: any;
  image?: string;
}

export default function FeedPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [commentImage, setCommentImage] = useState<File | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    loadPosts();
  }, [user]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      // Por enquanto, feed vazio até implementar posts reais no Firebase
      setPosts([]);
      setLoading(false);
    } catch (error) {
      console.error('Error loading posts:', error);
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user?.uid) return;

    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const isLiked = post.likes.includes(user.uid);
        return {
          ...post,
          likes: isLiked 
            ? post.likes.filter(id => id !== user.uid)
            : [...post.likes, user.uid]
        };
      }
      return post;
    }));

    toast.success('Reação registrada!');
  };

  const handleComment = async (postId: string) => {
    if (!user?.uid || !newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment,
      authorId: user.uid,
      authorName: user.displayName || user.email || 'Usuário',
      createdAt: new Date(),
      image: commentImage ? URL.createObjectURL(commentImage) : undefined
    };

    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, comment]
        };
      }
      return post;
    }));

    setNewComment('');
    setCommentImage(null);
    setSelectedPost(null);
    toast.success('Comentário adicionado!');
  };

  const formatDate = (date: any) => {
    const now = new Date();
    const postDate = date.toDate ? date.toDate() : new Date(date);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora mesmo';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    return postDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Voltar ao Dashboard</span>
            </button>
            
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Feed Social</h1>
            
            <div className="flex items-center space-x-2">
              <UserCircleIcon className="w-6 h-6 text-gray-400" />
              <span className="text-sm text-gray-600 hidden sm:inline">{user?.displayName || user?.email}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Posts */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-lg p-6">
              {/* Post Header */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {post.authorName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{post.authorName}</h3>
                  <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
                </div>
              </div>

              {/* Post Content */}
              <div className="mb-4">
                <p className="text-gray-800 leading-relaxed">{post.content}</p>
                {post.image && (
                  <img 
                    src={post.image} 
                    alt="Post image" 
                    className="mt-4 rounded-lg max-w-full h-auto"
                  />
                )}
              </div>

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors"
                  >
                    {post.likes.includes(user?.uid || '') ? (
                      <HeartIconSolid className="w-5 h-5 text-red-500" />
                    ) : (
                      <HeartIcon className="w-5 h-5" />
                    )}
                    <span className="text-sm">{post.likes.length}</span>
                  </button>

                  <button
                    onClick={() => setSelectedPost(selectedPost === post.id ? null : post.id)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors"
                  >
                    <ChatBubbleLeftIcon className="w-5 h-5" />
                    <span className="text-sm">{post.comments.length}</span>
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              {selectedPost === post.id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  {/* Add Comment */}
                  <div className="mb-4">
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Adicione um comentário..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          rows={2}
                        />
                      </div>
                      <div className="flex flex-col space-y-2">
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setCommentImage(e.target.files?.[0] || null)}
                            className="hidden"
                          />
                          <PhotoIcon className="w-6 h-6 text-gray-400 hover:text-blue-500" />
                        </label>
                        <button
                          onClick={() => handleComment(post.id)}
                          disabled={!newComment.trim()}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <PaperAirplaneIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {commentImage && (
                      <div className="mt-2">
                        <img 
                          src={URL.createObjectURL(commentImage)} 
                          alt="Preview" 
                          className="w-20 h-20 object-cover rounded"
                        />
                      </div>
                    )}
                  </div>

                  {/* Comments List */}
                  <div className="space-y-3">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="flex space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xs">
                            {comment.authorName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-semibold text-sm text-gray-900">{comment.authorName}</span>
                              <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                            </div>
                            <p className="text-sm text-gray-800">{comment.content}</p>
                            {comment.image && (
                              <img 
                                src={comment.image} 
                                alt="Comment image" 
                                className="mt-2 rounded max-w-xs h-auto"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* No Posts Message */}
        {posts.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <ChatBubbleLeftIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Nenhuma publicação ainda
            </h3>
            <p className="text-gray-600">
              O admin ainda não fez nenhuma publicação no feed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 