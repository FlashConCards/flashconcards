'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { getCourses, createCourse, deleteCourse, uploadFile } from '@/lib/firebase';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Course {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  createdAt: any;
}

export default function CoursesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newCourse, setNewCourse] = useState({
    name: '',
    description: '',
    image: '',
    price: 0,
    expirationMonths: 6 // Padrão: 6 meses
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Check if user is admin
  useEffect(() => {
    if (user && !user.isAdmin) {
      router.push('/dashboard');
    } else if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const loadCourses = async () => {
    try {
      const coursesData = await getCourses();
      setCourses(coursesData || []);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.isAdmin) {
      loadCourses();
    }
  }, [user]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Verificar tamanho do arquivo (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem é muito grande. Selecione uma imagem menor que 5MB.');
        return;
      }
      
      setSelectedImage(file);
      
      // Comprimir imagem antes de converter para Base64
      const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve) => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          
          img.onload = () => {
            // Calcular novas dimensões (máximo 600x400 para reduzir ainda mais)
            let { width, height } = img;
            const maxWidth = 600;
            const maxHeight = 400;
            
            if (width > height) {
              if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
              }
            } else {
              if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Desenhar imagem comprimida
            ctx?.drawImage(img, 0, 0, width, height);
            
            // Converter para Base64 com qualidade ainda mais reduzida
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);
            resolve(compressedBase64);
          };
          
          img.src = URL.createObjectURL(file);
        });
      };
      
      // Comprimir e criar preview
      compressImage(file).then((base64String) => {
        setImagePreview(base64String);
        console.log('Imagem comprimida com sucesso');
        console.log('Tamanho do Base64:', base64String.length, 'caracteres');
      });
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    setNewCourse({ ...newCourse, image: '' });
  };

  const handleAddCourse = async () => {
    try {
      console.log('=== INICIANDO CRIAÇÃO DO CURSO ===');
      console.log('Dados do curso:', newCourse);
      console.log('Imagem selecionada:', selectedImage);
      console.log('Image preview:', imagePreview ? 'Existe' : 'Não existe');
      
      if (!newCourse.name || !newCourse.description) {
        alert('Preencha todos os campos obrigatórios');
        return;
      }

      setUploading(true);
      let imageUrl = '';

      // Usar Base64 se foi selecionada uma imagem
      if (selectedImage && imagePreview) {
        console.log('Usando imagem em Base64...');
        imageUrl = imagePreview; // Base64 string
        console.log('Base64 length:', imageUrl.length);
      } else {
        // Usar imagem padrão se não foi selecionada
        console.log('Usando imagem padrão...');
        imageUrl = 'https://via.placeholder.com/400x300/cccccc/666666?text=Curso';
      }

      // Criar curso com a imagem
      console.log('Criando curso no Firebase...');
      const courseData = {
        name: newCourse.name,
        description: newCourse.description,
        price: newCourse.price,
        image: imageUrl
      };
      console.log('Dados finais do curso:', courseData);
      
      const courseId = await createCourse(courseData);
      console.log('Curso criado com ID:', courseId);

      console.log('Recarregando lista de cursos...');
      await loadCourses();
      
      setNewCourse({ name: '', description: '', image: '', price: 0, expirationMonths: 6 });
      setSelectedImage(null);
      setImagePreview('');
      setShowAddModal(false);
      setUploading(false);
      alert('Curso criado com sucesso!');
      console.log('=== CURSO CRIADO COM SUCESSO ===');
    } catch (error: any) {
      console.error('=== ERRO AO CRIAR CURSO ===');
      console.error('Error creating course:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      alert(`Erro ao criar curso: ${error.message}`);
      setUploading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (confirm('Tem certeza que deseja excluir este curso?')) {
      try {
        await deleteCourse(courseId);
        await loadCourses();
        alert('Curso excluído com sucesso!');
      } catch (error: any) {
        console.error('Error deleting course:', error);
        alert(`Erro ao excluir curso: ${error.message}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando cursos...</p>
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
          <h1 className="text-3xl font-bold text-gray-800">Gerenciar Cursos</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Adicionar Curso
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Imagem do curso */}
              <div className="aspect-video bg-gray-200 relative overflow-hidden">
                {course.image ? (
                  <img
                    src={course.image}
                    alt={course.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-full h-full flex items-center justify-center bg-gray-100 ${course.image ? 'hidden' : ''}`}>
                  <PhotoIcon className="h-12 w-12 text-gray-400" />
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.name}</h3>
                <p className="text-gray-600 mb-4">{course.description}</p>
                
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-green-600">
                    R$ {course.price?.toFixed(2).replace('.', ',') || '0,00'}
                  </span>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push(`/admin/subjects?courseId=${course.id}`)}
                      className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200"
                    >
                      Matérias
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="text-xs bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-12">
            <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum curso cadastrado</h3>
            <p className="text-gray-600">Clique em "Adicionar Curso" para começar</p>
          </div>
        )}

        {/* Add Course Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Adicionar Curso</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Curso *
                  </label>
                  <input
                    type="text"
                    value={newCourse.name}
                    onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome do curso"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição *
                  </label>
                  <textarea
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descrição do curso"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preço
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newCourse.price}
                    onChange={(e) => setNewCourse({...newCourse, price: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiração (meses)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={newCourse.expirationMonths}
                    onChange={(e) => setNewCourse({...newCourse, expirationMonths: parseInt(e.target.value) || 6})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="6"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Tempo de acesso ao curso em meses (padrão: 6 meses)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imagem do Curso
                  </label>
                  
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-md"
                      />
                      <button
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                      <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Selecionar Imagem
                      </label>
                      <p className="text-sm text-gray-500 mt-2">
                        JPG, PNG, GIF até 5MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewCourse({ name: '', description: '', image: '', price: 0, expirationMonths: 6 });
                    setSelectedImage(null);
                    setImagePreview('');
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddCourse}
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Salvando...' : 'Adicionar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 