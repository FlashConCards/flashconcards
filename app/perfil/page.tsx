"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PerfilPage() {
  const [user, setUser] = useState<any>(null);
  const [profileData, setProfileData] = useState({
    displayName: '',
    photoURL: '',
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('flashconcards_user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const userInfo = JSON.parse(userData);
    setUser(userInfo);
    setProfileData(prev => ({
      ...prev,
      displayName: userInfo.displayName || userInfo.name || '',
      photoURL: userInfo.photoURL || '',
      email: userInfo.email || ''
    }));
  }, [router]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) {
      setProfileError('Nenhum arquivo selecionado');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setProfileError('Por favor, selecione apenas arquivos de imagem (JPG, PNG, etc.)');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setProfileError('A imagem deve ter no máximo 2MB');
      return;
    }
    setUploadingPhoto(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.uid || user.email?.replace(/[^a-zA-Z0-9]/g, '_') || 'unknown');
      const response = await fetch('/api/upload-profile-photo', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro no upload');
      }
      const result = await response.json();
      setProfileData(prev => ({ ...prev, photoURL: result.url }));
      setProfileSuccess('Foto de perfil atualizada com sucesso!');
      // Atualizar localStorage
      const updatedUser = { ...user, photoURL: result.url };
      setUser(updatedUser);
      localStorage.setItem('flashconcards_user', JSON.stringify(updatedUser));
    } catch (error: any) {
      setProfileError(error.message || 'Erro ao fazer upload da foto');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
      setProfileError('As senhas não coincidem');
      return;
    }
    // Aqui você pode implementar a lógica de atualização de senha se desejar
    setProfileSuccess('Perfil atualizado com sucesso!');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center shadow-2xl"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Meu Perfil</h1>
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <img
              src={profileData.photoURL || '/default-avatar.png'}
              alt="Foto de perfil"
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-200"
            />
            <label className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 cursor-pointer hover:bg-blue-600 transition-colors">
              <Camera size={18} />
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
          </div>
          <span className="mt-3 text-lg font-medium text-gray-800">{profileData.displayName}</span>
          <span className="text-sm text-gray-500 flex items-center justify-center mt-1"><Mail className="mr-1" size={14} />{profileData.email}</span>
        </div>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-left text-gray-700 mb-1">Nome</label>
            <input
              type="text"
              value={profileData.displayName}
              onChange={e => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-left text-gray-700 mb-1">Nova Senha</label>
            <input
              type="password"
              value={profileData.newPassword}
              onChange={e => setProfileData(prev => ({ ...prev, newPassword: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Digite a nova senha"
            />
          </div>
          <div>
            <label className="block text-left text-gray-700 mb-1">Confirmar Nova Senha</label>
            <input
              type="password"
              value={profileData.confirmPassword}
              onChange={e => setProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Confirme a nova senha"
            />
          </div>
          {profileError && <div className="text-red-600 text-sm">{profileError}</div>}
          {profileSuccess && <div className="text-green-600 text-sm">{profileSuccess}</div>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            disabled={uploadingPhoto}
          >
            {uploadingPhoto ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      </motion.div>
    </div>
  );
} 