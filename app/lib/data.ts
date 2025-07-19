import { db } from './firebase'
import { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc } from 'firebase/firestore'

export interface UserData {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  joinedAt: Date;
  passedExam?: boolean;
  examDate?: Date;
  feedback?: {
    rating: number;
    comment: string;
    date: Date;
  };
}

// Funções para calcular estatísticas reais usando Firebase
export async function getApprovalRate(): Promise<number> {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'))
    const users = querySnapshot.docs.map(doc => doc.data())
    
    const usersWhoTookExam = users.filter(user => user.passedExam !== undefined);
    const usersWhoPassed = usersWhoTookExam.filter(user => user.passedExam === true);
    
    if (usersWhoTookExam.length === 0) return 0;
    return Math.round((usersWhoPassed.length / usersWhoTookExam.length) * 100);
  } catch (error) {
    console.error('Erro ao calcular taxa de aprovação:', error)
    return 0
  }
}

export async function getActiveStudents(): Promise<number> {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'))
    const users = querySnapshot.docs.map(doc => doc.data())
    return users.filter(user => user.isActive).length;
  } catch (error) {
    console.error('Erro ao contar estudantes ativos:', error)
    return 0
  }
}

export async function getTotalStudents(): Promise<number> {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'))
    return querySnapshot.docs.length;
  } catch (error) {
    console.error('Erro ao contar total de estudantes:', error)
    return 0
  }
}

export async function getRealTestimonials() {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'))
    const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as UserData[]
    
    return users
      .filter(user => user.feedback)
      .map(user => ({
        name: user.name,
        role: user.passedExam ? 'Aprovado(a)' : 'Candidato(a)',
        content: user.feedback!.comment,
        rating: user.feedback!.rating,
        date: user.feedback!.date
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6); // Retorna os 6 feedbacks mais recentes
  } catch (error) {
    console.error('Erro ao buscar depoimentos:', error)
    return []
  }
}

// Função para adicionar novo usuário
export async function addUser(userData: Omit<UserData, 'id'>): Promise<UserData | null> {
  try {
    const docRef = await addDoc(collection(db, 'users'), {
      ...userData,
      joinedAt: new Date().toISOString()
    })
    
    return {
      ...userData,
      id: docRef.id
    }
  } catch (error) {
    console.error('Erro ao adicionar usuário:', error)
    return null
  }
}

// Função para atualizar status de aprovação
export async function updateUserApprovalStatus(userId: string, passed: boolean, examDate?: Date): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      passedExam: passed,
      examDate: examDate ? examDate.toISOString() : null
    })
  } catch (error) {
    console.error('Erro ao atualizar status de aprovação:', error)
  }
}

// Função para adicionar feedback
export async function addUserFeedback(userId: string, rating: number, comment: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      feedback: {
        rating,
        comment,
        date: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Erro ao adicionar feedback:', error)
  }
}

// Função para buscar usuário por email
export async function getUserByEmail(email: string): Promise<UserData | null> {
  try {
    const q = query(collection(db, 'users'), where('email', '==', email))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      return { id: doc.id, ...doc.data() } as UserData
    }
    return null
  } catch (error) {
    console.error('Erro ao buscar usuário por email:', error)
    return null
  }
} 