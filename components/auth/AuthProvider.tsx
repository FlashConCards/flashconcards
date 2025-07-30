'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';

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
    // Mock auth state for deployment
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login for deployment
    const mockUser: User = {
      uid: 'mock-user-id',
      email,
      displayName: email.split('@')[0],
      photoURL: '',
      isAdmin: email === 'claudioghabryel.cg@gmail.com' || email === 'natalhia775@gmail.com',
      isPaid: false,
      isActive: true,
      studyTime: 0,
      cardsStudied: 0,
      cardsCorrect: 0,
      cardsWrong: 0,
      createdAt: null,
      updatedAt: null,
    };
    setUser(mockUser);
  };

  const register = async (email: string, password: string, userData: any) => {
    // Mock register for deployment
    const mockUser: User = {
      uid: 'mock-user-id',
      email,
      displayName: userData.displayName || email.split('@')[0],
      photoURL: '',
      isAdmin: email === 'claudioghabryel.cg@gmail.com' || email === 'natalhia775@gmail.com',
      isPaid: false,
      isActive: true,
      studyTime: 0,
      cardsStudied: 0,
      cardsCorrect: 0,
      cardsWrong: 0,
      createdAt: null,
      updatedAt: null,
    };
    setUser(mockUser);
  };

  const logout = async () => {
    // Mock logout for deployment
    setUser(null);
  };

  const updateUser = async (data: any) => {
    // Mock update user for deployment
    if (user) {
      setUser({ ...user, ...data });
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