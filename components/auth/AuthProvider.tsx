'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';
import { auth, signInUser, createUser, signOutUser, updateUserData, getUserData, onAuthStateChanged, db } from '@/lib/firebase';
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

// Função para verificar se o email é de admin
const isAdminEmail = (email: string) => {
  const adminEmails = [
    'claudioghabryel.cg@gmail.com',
    'natalhia775@gmail.com',
    'claudioghabryel7@gmail.com'
  ];
  return adminEmails.includes(email);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          console.log('Firebase user authenticated:', firebaseUser.email);
          
          // Buscar dados do usuário na coleção users
          const userData = await getUserData(firebaseUser.uid)
          
          if (userData) {
            console.log('User data found in database:', userData.email);
            setUser({
              uid: firebaseUser.uid,
              email: userData.email || firebaseUser.email || '',
              displayName: userData.displayName || firebaseUser.displayName || '',
              photoURL: userData.photoURL || firebaseUser.photoURL || '',
              isAdmin: userData.isAdmin || isAdminEmail(userData.email || firebaseUser.email || ''),
              isPaid: userData.isPaid || false,
              isActive: userData.isActive || true,
              studyTime: userData.studyTime || 0,
              cardsStudied: userData.cardsStudied || 0,
              cardsCorrect: userData.cardsCorrect || 0,
              cardsWrong: userData.cardsWrong || 0,
              createdByAdmin: userData.createdByAdmin || false,
              selectedCourse: userData.selectedCourse || '',
              lastLoginAt: userData.lastLoginAt || null,
              createdAt: userData.createdAt || null,
              updatedAt: userData.updatedAt || null
            })
          } else {
            console.log('User not found in database, creating temp user');
            const userEmail = firebaseUser.email || '';
            const isAdmin = isAdminEmail(userEmail);
            
            // Criar usuário temporário se não encontrar
            const tempUser = {
              uid: firebaseUser.uid,
              email: userEmail,
              displayName: firebaseUser.displayName || '',
              photoURL: firebaseUser.photoURL || '',
              isAdmin: isAdmin, // Verificar se é admin pelo email
              isPaid: true, // Dar acesso como se fosse pago
              isActive: true,
              studyTime: 0,
              cardsStudied: 0,
              cardsCorrect: 0,
              cardsWrong: 0,
              createdByAdmin: true, // Marcar como criado pelo admin
              selectedCourse: 'default',
              lastLoginAt: new Date(),
              createdAt: new Date(),
              updatedAt: new Date()
            }
            console.log('Created temp user with admin status:', isAdmin);
            setUser(tempUser)
          }
        } catch (error) {
          console.error('Error getting user data:', error)
          const userEmail = firebaseUser.email || '';
          const isAdmin = isAdminEmail(userEmail);
          
          // Fallback to basic user data
          setUser({
            uid: firebaseUser.uid,
            email: userEmail,
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || '',
            isAdmin: isAdmin, // Verificar se é admin pelo email
            isPaid: true, // Dar acesso como se fosse pago
            isActive: true,
            studyTime: 0,
            cardsStudied: 0,
            cardsCorrect: 0,
            cardsWrong: 0,
            createdByAdmin: true, // Marcar como criado pelo admin
            selectedCourse: 'default',
            lastLoginAt: null,
            createdAt: null,
            updatedAt: null
          })
        }
      } else {
        console.log('No Firebase user, setting user to null');
        setUser(null)
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login with:', email);
      await signInUser(email, password);
    } catch (error) {
      console.error('Login error:', error);
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
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateUser = async (data: any) => {
    try {
      if (user) {
        await updateUserData(user.uid, data);
      }
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}; 