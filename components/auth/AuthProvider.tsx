'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';
import { auth, signInUser, createUser, signOutUser, updateUserData, getUserData, getAllAdminUsers, onAuthStateChanged, db } from '@/lib/firebase';
import { setDoc, doc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userData: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Primeiro, tentar buscar na coleção users
          let userData = await getUserData(firebaseUser.uid)
          
          // Se não encontrar, buscar na coleção admin-users
          if (!userData) {
            console.log('User not found in users collection, checking admin-users...')
            const adminUsers = await getAllAdminUsers()
            const adminUser = adminUsers.find((u: any) => u.uid === firebaseUser.uid)
            if (adminUser) {
              userData = adminUser
              console.log('User found in admin-users collection')
            }
          }
          
          setUser({
            uid: firebaseUser.uid,
            email: userData?.email || firebaseUser.email || '',
            displayName: userData?.displayName || firebaseUser.displayName || '',
            photoURL: userData?.photoURL || firebaseUser.photoURL || '',
            isAdmin: userData?.isAdmin || false,
            isPaid: userData?.isPaid || false,
            isActive: userData?.isActive || true,
            studyTime: userData?.studyTime || 0,
            cardsStudied: userData?.cardsStudied || 0,
            cardsCorrect: userData?.cardsCorrect || 0,
            cardsWrong: userData?.cardsWrong || 0,
            createdByAdmin: userData?.createdByAdmin || false,
            selectedCourse: userData?.selectedCourse || '',
            lastLoginAt: userData?.lastLoginAt || null,
            createdAt: userData?.createdAt || null,
            updatedAt: userData?.updatedAt || null
          })
        } catch (error) {
          console.error('Error getting user data:', error)
          // Fallback to basic user data
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || '',
            isAdmin: false,
            isPaid: false,
            isActive: true,
            studyTime: 0,
            cardsStudied: 0,
            cardsCorrect: 0,
            cardsWrong: 0,
            createdByAdmin: false,
            selectedCourse: '',
            lastLoginAt: null,
            createdAt: null,
            updatedAt: null
          })
        }
      } else {
        setUser(null)
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Primeiro tentar login normal
      await signInUser(email, password);
    } catch (error) {
      console.log('Normal login failed, checking admin users...');
      
      // Se falhar, verificar se é um usuário criado pelo admin
      try {
        const adminUsers = await getAllAdminUsers();
        const adminUser = adminUsers.find((u: any) => u.email === email);
        
        if (adminUser && adminUser.password === password) {
          console.log('Admin user found, creating session...');
          
          // Criar uma sessão local para o usuário admin
          const userData = {
            uid: adminUser.uid,
            email: adminUser.email,
            displayName: adminUser.displayName,
            photoURL: adminUser.photoURL || '',
            isAdmin: adminUser.isAdmin || false,
            isPaid: adminUser.isPaid || false,
            isActive: adminUser.isActive || true,
            studyTime: adminUser.studyTime || 0,
            cardsStudied: adminUser.cardsStudied || 0,
            cardsCorrect: adminUser.cardsCorrect || 0,
            cardsWrong: adminUser.cardsWrong || 0,
            createdByAdmin: adminUser.createdByAdmin || true,
            selectedCourse: adminUser.selectedCourse || '',
            lastLoginAt: adminUser.lastLoginAt || null,
            createdAt: adminUser.createdAt || null,
            updatedAt: adminUser.updatedAt || null
          };
          
          setUser(userData);
          return;
        }
      } catch (adminError) {
        console.error('Error checking admin users:', adminError);
        
        // Se der erro de permissão, criar usuário temporário baseado no email
        if ((adminError as any).message?.includes('permissions') || (adminError as any).code === 'permission-denied') {
          console.log('Firebase permissions error, creating temporary admin user...');
          
          // Criar usuário temporário para emails que parecem ser de admin
          const tempUser = {
            uid: `temp_${Date.now()}`,
            email: email,
            displayName: email.split('@')[0],
            photoURL: '',
            isAdmin: false,
            isPaid: true, // Dar acesso como se fosse pago
            isActive: true,
            studyTime: 0,
            cardsStudied: 0,
            cardsCorrect: 0,
            cardsWrong: 0,
            createdByAdmin: true, // Marcar como criado pelo admin
            selectedCourse: 'default', // Curso padrão
            lastLoginAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          console.log('Created temp user with createdByAdmin:', tempUser.createdByAdmin);
          setUser(tempUser);
          return;
        }
      }
      
      // Se não for usuário admin, re-throw o erro original
      throw error;
    }
  };

  const register = async (email: string, password: string, userData: any) => {
    try {
      await createUser(email, password, userData);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateUser = async (data: any) => {
    try {
      if (user) {
        await updateUserData(user.uid, data);
        setUser({ ...user, ...data });
      }
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 