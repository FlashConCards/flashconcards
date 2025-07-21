'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, CheckCircle, Trophy, MessageSquare, TrendingUp, User, Calendar, Target, BarChart3, Clock, ArrowRight, Calculator, Scale, Building2, MapPin, FileText, Shield, Users, PenTool, Camera, Lock, Save, X } from 'lucide-react'
import Link from 'next/link'
import conteudoProgramatico from '../../../conteudo_programatico.json';
import { db, storage, auth } from '../../../app/lib/firebase';
import { collection, query, where, getCountFromServer, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signOut, updatePassword, updateProfile } from 'firebase/auth';
import { useRouter } from 'next/navigation';

interface UserStats {
  totalCards: number
  cardsStudied: number
  generalProgress: number
  daysStudying: number
  lastLogin: string
  totalSubjects: number
}

interface Subject {
  id: string
  name: string
  description: string
  totalCards: number
  completedCards: number
  icon: any
  color: string
}

export default function PaidDashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<UserStats>({
    totalCards: 0,
    cardsStudied: 0,
    generalProgress: 0,
    daysStudying: 0,
    lastLogin: '',
    totalSubjects: 0
  })
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showProfile, setShowProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: '',
    photoURL: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  useEffect(() => {
    // Verificar se usuário está logado
    const userData = localStorage.getItem('flashconcards_user')
    if (!userData) {
      window.location.href = '/login'
      return
    }

    const userInfo = JSON.parse(userData)
    setUser(userInfo)

    // Buscar dados reais do Firebase
    fetchUserStats(userInfo.email)
    
    // Carregar matérias disponíveis
    loadSubjects(userInfo.email)
    // Buscar total de cards e progresso geral em tempo real
    loadDashboardStats(userInfo.email)
  }, [])

  const fetchUserStats = async (email: string) => {
    try {
      // Buscar dados do usuário no Firebase
      const response = await fetch('/api/user/stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        // Se não conseguir buscar dados reais, usar dados padrão
        setStats({
          totalCards: 150,
          cardsStudied: 0,
          generalProgress: 0,
          daysStudying: 1,
          lastLogin: new Date().toISOString(),
          totalSubjects: 10
        })
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      // Dados padrão em caso de erro
      setStats({
        totalCards: 150,
        cardsStudied: 0,
        generalProgress: 0,
        daysStudying: 1,
        lastLogin: new Date().toISOString(),
        totalSubjects: 10
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Atualizar todos os indicadores do dashboard em tempo real
  const loadDashboardStats = async (email: string) => {
    // Total de flashcards
    let totalCards = 0;
    try {
      const snap = await getCountFromServer(collection(db, 'flashcards'));
      totalCards = snap.data().count || 0;
    } catch (e) {
      totalCards = 0;
    }
    // Cards estudados pelo usuário
    let cardsStudied = 0;
    try {
      const q = query(collection(db, 'userProgress'), where('userId', '==', email));
      const snap = await getDocs(q);
      // Considera apenas flashcards únicos estudados
      const uniqueCards = new Set(snap.docs.map(doc => doc.data().flashcardId));
      cardsStudied = uniqueCards.size;
    } catch (e) {
      cardsStudied = 0;
    }
    // Progresso geral
    const generalProgress = totalCards > 0 ? Math.round((cardsStudied / totalCards) * 100) : 0;
    setStats(prev => ({
      ...prev,
      totalCards,
      cardsStudied,
      generalProgress
    }));
  }

  const iconMap: Record<string, any> = {
    'Língua Portuguesa': BookOpen,
    'Noções de Informática': Target,
    'Direito Constitucional': TrendingUp,
    'Direito Administrativo': BarChart3,
    'Realidade Étnica, Social, Histórica, Geográfica, Cultural e Política de Goiás': Clock,
    'Legislação Específica da ALEGO': CheckCircle,
    'Noções de Segurança Pública / SUSP': MessageSquare,
    'Qualidade na Prestação do Serviço Público / Trabalho em Equipe': User,
    'Redação (Prova Discursiva)': Trophy
  };
  const colorMap: Record<string, string> = {
    'Língua Portuguesa': 'bg-blue-500',
    'Noções de Informática': 'bg-green-500',
    'Direito Constitucional': 'bg-purple-500',
    'Direito Administrativo': 'bg-orange-500',
    'Realidade Étnica, Social, Histórica, Geográfica, Cultural e Política de Goiás': 'bg-red-500',
    'Legislação Específica da ALEGO': 'bg-indigo-500',
    'Noções de Segurança Pública / SUSP': 'bg-pink-500',
    'Qualidade na Prestação do Serviço Público / Trabalho em Equipe': 'bg-yellow-500',
    'Redação (Prova Discursiva)': 'bg-gray-500'
  };

  const loadSubjects = async (email: string) => {
    // Carregar matérias do JSON
    const subjectsData: Subject[] = conteudoProgramatico.map((item) => ({
      id: item.titulo.toLowerCase().replace(/[^a-z0-9]+/gi, '-'),
      name: item.titulo,
      description: item.topicos[0] || '',
      totalCards: 0, // será atualizado abaixo
      completedCards: 0,
      icon: iconMap[item.titulo] || BookOpen,
      color: colorMap[item.titulo] || 'bg-blue-500'
    }));

    // Buscar total de flashcards reais do Firebase para cada matéria
    const updatedSubjects = await Promise.all(
      subjectsData.map(async (subject) => {
        let totalCards = 0;
        try {
          const q = query(collection(db, 'flashcards'), where('subject', '==', subject.name));
          const snap = await getCountFromServer(q);
          totalCards = snap.data().count || 0;
        } catch (e) {
          totalCards = 0;
        }
        // Buscar progresso real de cada matéria (mantém como antes)
        let completedCards = 0;
        try {
          const response = await fetch('/api/user/subject-progress', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, subjectId: subject.id })
          })
          if (response.ok) {
            const progressData = await response.json();
            completedCards = progressData.completedCards || 0;
          }
        } catch (error) {}
        return {
          ...subject,
          totalCards,
          completedCards
        };
      })
    );
    setSubjects(updatedSubjects);
  }

  const getProgressPercentage = (completed: number, total: number) => {
    return Math.round((completed / total) * 100)
  }

  const handleLogout = () => {
    localStorage.removeItem('flashconcards_user')
    window.location.href = '/'
  }

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) {
      setProfileError('Nenhum arquivo selecionado');
      return;
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setProfileError('Por favor, selecione apenas arquivos de imagem (JPG, PNG, etc.)');
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setProfileError('A imagem deve ter no máximo 5MB');
      return;
    }

    setUploadingPhoto(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      console.log('Iniciando upload da foto...', { fileName: file.name, fileSize: file.size, fileType: file.type });

      // Gerar nome único para o arquivo
      const fileExtension = file.name.split('.').pop();
      const uniqueFileName = `profile_${Date.now()}.${fileExtension}`;
      
      // Upload para Firebase Storage
      const storageRef = ref(storage, `profile-photos/${user.uid}/${uniqueFileName}`);
      console.log('Referência do storage:', storageRef.fullPath);
      
      const uploadResult = await uploadBytes(storageRef, file);
      console.log('Upload concluído:', uploadResult);
      
      const downloadURL = await getDownloadURL(storageRef);
      console.log('URL de download obtida:', downloadURL);

      // Atualizar perfil do usuário no Firebase Auth
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          photoURL: downloadURL
        });
        console.log('Perfil do Firebase Auth atualizado');
      }

      // Atualizar no Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        photoURL: downloadURL,
        updated_at: new Date().toISOString()
      });
      console.log('Dados do Firestore atualizados');

      setProfileData((prev: any) => ({ ...prev, photoURL: downloadURL }));
      setProfileSuccess('Foto de perfil atualizada com sucesso!');
      
      // Recarregar dados do usuário
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        setUser((prev: any) => ({ ...prev, ...userDoc.data() }));
      }

    } catch (error: any) {
      console.error('Erro detalhado ao fazer upload da foto:', error);
      
      let errorMessage = 'Erro ao fazer upload da foto. Tente novamente.';
      
      if (error.code === 'storage/unauthorized') {
        errorMessage = 'Erro de permissão. Verifique as regras do Firebase Storage.';
      } else if (error.code === 'storage/quota-exceeded') {
        errorMessage = 'Limite de armazenamento excedido.';
      } else if (error.code === 'storage/invalid-format') {
        errorMessage = 'Formato de arquivo inválido.';
      }
      
      setProfileError(errorMessage);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !auth.currentUser) return;

    setUpdatingProfile(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      // Validar senhas se fornecidas
      if (profileData.newPassword) {
        if (profileData.newPassword !== profileData.confirmPassword) {
          setProfileError('As senhas não coincidem');
          return;
        }
        if (profileData.newPassword.length < 6) {
          setProfileError('A senha deve ter pelo menos 6 caracteres');
          return;
        }
      }

      // Atualizar perfil no Firebase Auth
      await updateProfile(auth.currentUser, {
        displayName: profileData.displayName || user.displayName
      });

      // Atualizar senha se fornecida
      if (profileData.newPassword) {
        await updatePassword(auth.currentUser, profileData.newPassword);
      }

      // Atualizar no Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: profileData.displayName || user.displayName,
        updated_at: new Date().toISOString()
      });

             setProfileSuccess('Perfil atualizado com sucesso!');
       setProfileData((prev: any) => ({ ...prev, newPassword: '', confirmPassword: '' }));

       // Recarregar dados do usuário
       const userDoc = await getDoc(userRef);
       if (userDoc.exists()) {
         setUser((prev: any) => ({ ...prev, ...userDoc.data() }));
       }

    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      setProfileError('Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center shadow-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 mb-8 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">FlashConCards</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
              >
                <User className="mr-2" size={16} />
                {showProfile ? 'Fechar Perfil' : 'Meu Perfil'}
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Bem-vindo, {user?.name || 'Usuário'}!
                </h2>
                <p className="text-blue-100">
                  Você tem acesso completo a todos os recursos do FlashConCards.
                </p>
              </div>
              <div className="text-right">
                <div className="bg-blue-400 bg-opacity-30 px-3 py-1 rounded-full text-sm mb-2">
                  Ativo
                </div>
                <div className="text-xs text-blue-200">
                  Versão Completa
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">Total de Cards</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalCards}+</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">Cards Estudados</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.cardsStudied}</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Trophy className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">Progresso Geral</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.generalProgress}%</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">Dias Estudando</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.daysStudying}</p>
          </div>
        </motion.div>

        {/* Profile Section */}
        {showProfile && (
          <div className="mb-8 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <User className="mr-2" />
                Meu Perfil
              </h2>
              <button
                onClick={() => setShowProfile(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {profileError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {profileError}
              </div>
            )}

            {profileSuccess && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {profileSuccess}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {/* Photo Upload */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={user?.photoURL || '/default-avatar.png'}
                    alt="Foto de perfil"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                  />
                  <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full cursor-pointer hover:bg-blue-600">
                    <Camera size={16} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={uploadingPhoto}
                    />
                  </label>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {uploadingPhoto ? 'Fazendo upload...' : 'Clique para alterar a foto'}
                  </p>
                </div>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={profileData.displayName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder={user?.displayName || 'Seu nome completo'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Email (readonly) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  O email não pode ser alterado
                </p>
              </div>

              {/* Password Change */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Lock className="mr-2" />
                  Alterar Senha
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nova Senha
                    </label>
                    <input
                      type="password"
                      value={profileData.newPassword}
                      onChange={(e) => setProfileData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Deixe em branco para manter a atual"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmar Nova Senha
                    </label>
                    <input
                      type="password"
                      value={profileData.confirmPassword}
                      onChange={(e) => setProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirme a nova senha"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowProfile(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center"
                >
                  {updatingProfile ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2" size={16} />
                      Salvar Alterações
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Subjects Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-2xl mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Matérias Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject, index) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
                className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <div className={`p-2 rounded-lg ${subject.color}`}>
                    <subject.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">{subject.name}</h3>
                    <p className="text-sm text-gray-600">{subject.description}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progresso</span>
                    <span>{subject.completedCards}/{subject.totalCards}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage(subject.completedCards, subject.totalCards)}%` }}
                    ></div>
                  </div>
                </div>
                
                <Link 
                  href={`/study/${subject.id}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                >
                  Começar a estudar
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl p-6 shadow-2xl"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Atividade Recente</h2>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Login realizado</p>
                <p className="text-sm text-gray-600">
                  {new Date(stats.lastLogin).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Progresso iniciado</p>
                <p className="text-sm text-gray-600">
                  {stats.cardsStudied} cards estudados
                </p>
              </div>
            </div>
          </div>
          
          {/* Feedback Link */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Compartilhe sua experiência</h3>
            <p className="text-sm text-gray-600 mb-3">
              Ajude outros alunos compartilhando como o FlashConCards te ajudou nos estudos.
            </p>
            <Link 
              href="/feedback"
              className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Deixar Feedback
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 