'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  signInUser, 
  createUser, 
  signOutUser, 
  getUserData,
  updateUserData,
  onUserDataChange
} from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userDoc = await getUserData(firebaseUser.uid);
          const userData = userDoc as Partial<User>;
          
          if (userData) {
            // Set admin status for specific emails
            const isAdmin = firebaseUser.email === 'claudioghabryel.cg@gmail.com' || 
                           firebaseUser.email === 'natalhia775@gmail.com';
            
            const user: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: (userData.displayName ?? firebaseUser.displayName) || '',
              photoURL: (userData.photoURL ?? firebaseUser.photoURL) || '',
              isAdmin: userData.isAdmin ?? isAdmin ?? false,
              isPaid: userData.isPaid ?? false,
              isActive: userData.isActive ?? true,
              studyTime: userData.studyTime ?? 0,
              cardsStudied: userData.cardsStudied ?? 0,
              cardsCorrect: userData.cardsCorrect ?? 0,
              cardsWrong: userData.cardsWrong ?? 0,
              createdAt: userData.createdAt ?? null,
              updatedAt: userData.updatedAt ?? null,
            };
            
            setUser(user);
          } else {
            // Create user document if it doesn't exist
            const isAdmin = firebaseUser.email === 'claudioghabryel.cg@gmail.com' || 
                           firebaseUser.email === 'natalhia775@gmail.com';
            
            const newUserData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || '',
              photoURL: firebaseUser.photoURL || '',
              isAdmin,
              isPaid: false,
              isActive: true,
              studyTime: 0,
              cardsStudied: 0,
              cardsCorrect: 0,
              cardsWrong: 0,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            await updateUserData(firebaseUser.uid, newUserData);
            
            const user: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              photoURL: firebaseUser.photoURL || '',
              isAdmin,
              isPaid: false,
              isActive: true,
              studyTime: 0,
              cardsStudied: 0,
              cardsCorrect: 0,
              cardsWrong: 0,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            setUser(user);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Real-time user data updates
  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = onUserDataChange(user.uid, (userData) => {
        if (userData) {
          setUser(prevUser => prevUser ? { ...prevUser, ...userData } : null);
        }
      });
      
      return () => unsubscribe();
    }
  }, [user?.uid]);

  const login = async (email: string, password: string) => {
    try {
      await signInUser(email, password);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const register = async (email: string, password: string, userData: any) => {
    try {
      await createUser(email, password, userData);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    try {
      await signOutUser();
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const updateUser = async (data: any) => {
    if (!user?.uid) throw new Error('Usuário não autenticado');
    
    try {
      await updateUserData(user.uid, data);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 