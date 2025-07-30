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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await getUserData(firebaseUser.uid)
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: userData?.displayName || firebaseUser.displayName || '',
            photoURL: userData?.photoURL || firebaseUser.photoURL || '',
            isAdmin: userData?.isAdmin || false,
            isPaid: userData?.isPaid || false,
            isActive: userData?.isActive || true,
            studyTime: userData?.studyTime || 0,
            cardsStudied: userData?.cardsStudied || 0,
            cardsCorrect: userData?.cardsCorrect || 0,
            cardsWrong: userData?.cardsWrong || 0,
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