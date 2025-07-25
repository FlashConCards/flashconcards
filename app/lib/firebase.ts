import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc } from 'firebase/firestore'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, User } from 'firebase/auth'
import { getStorage } from 'firebase/storage'
import { firebaseConfig } from './firebase-config'

// Configuração do Firebase
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || firebaseConfig.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || firebaseConfig.appId
}

// Inicializar Firebase apenas se as variáveis estiverem configuradas
let app: any = null
let db: any = null
let auth: any = null
let storage: any = null

try {
  app = initializeApp(config)
  db = getFirestore(app)
  auth = getAuth(app)
  storage = getStorage(app)
  console.log('Firebase inicializado com sucesso')
} catch (error) {
  console.warn('Erro ao inicializar Firebase:', error)
}

export { db, auth, storage }

// Interface para pagamentos
export interface PaymentRecord {
  id?: string
  email: string
  payment_id: string
  amount: number
  status: 'approved' | 'pending' | 'rejected'
  created_at?: string
  method: 'pix' | 'card' | 'admin'
}

// Interface para usuários
export interface UserRecord {
  id?: string
  email: string
  name: string
  isPaid: boolean
  paymentId?: string
  createdAt?: string
  lastLogin?: string
}

// Interface para flashcards
export interface Flashcard {
  id?: string
  subject: string
  question: string
  answer: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  created_at?: string
}

// Interface para progresso do usuário
export interface UserProgress {
  id?: string
  userId: string
  flashcardId: string
  isCorrect: boolean
  answeredAt: string
  timeSpent: number
}

// Funções para gerenciar pagamentos
export async function addPaymentRecord(payment: PaymentRecord) {
  if (!db) {
    console.warn('Firebase não inicializado')
    return null
  }
  
  try {
    const docRef = await addDoc(collection(db, 'payments'), {
      ...payment,
      created_at: new Date().toISOString()
    })
    return docRef.id
  } catch (error) {
    console.error('Erro ao adicionar pagamento:', error)
    return null
  }
}

export async function checkPaymentByEmail(email: string): Promise<PaymentRecord | null> {
  if (!db) {
    console.warn('Firebase não inicializado')
    return null
  }
  
  try {
    const q = query(collection(db, 'payments'), where('email', '==', email))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      return { id: doc.id, ...doc.data() } as PaymentRecord
    }
    return null
  } catch (error) {
    console.error('Erro ao verificar pagamento:', error)
    return null
  }
}

export async function isUserPaid(email: string): Promise<boolean> {
  if (!db) {
    console.warn('Firebase não inicializado')
    return false
  }
  
  try {
    const payment = await checkPaymentByEmail(email)
    
    // Verificar se é um pagamento aprovado ou usuário criado pelo admin
    if (payment) {
      console.log('Pagamento encontrado para:', email, 'Status:', payment.status, 'Método:', payment.method)
      return payment.status === 'approved' || payment.method === 'admin'
    }
    
    console.log('Nenhum pagamento encontrado para:', email)
    return false
  } catch (error) {
    console.error('Erro ao verificar se usuário pagou:', error)
    return false
  }
}

// Funções para gerenciar usuários
export async function createUser(userData: Omit<UserRecord, 'id'>) {
  if (!db) {
    console.warn('Firebase não inicializado')
    return null
  }
  
  try {
    const docRef = await addDoc(collection(db, 'users'), {
      ...userData,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    })
    return docRef.id
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return null
  }
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  if (!db) {
    console.warn('Firebase não inicializado')
    return null
  }
  
  try {
    const q = query(collection(db, 'users'), where('email', '==', email))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      return { id: doc.id, ...doc.data() } as UserRecord
    }
    return null
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    return null
  }
}

export async function updateUserLastLogin(userId: string) {
  if (!db) {
    console.warn('Firebase não inicializado')
    return
  }
  
  try {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      lastLogin: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erro ao atualizar último login:', error)
  }
}

// Funções para flashcards
export async function getFlashcardsBySubject(subject: string): Promise<Flashcard[]> {
  if (!db) {
    console.warn('Firebase não inicializado')
    return []
  }
  
  try {
    const q = query(collection(db, 'flashcards'), where('subject', '==', subject))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Flashcard[]
  } catch (error) {
    console.error('Erro ao buscar flashcards:', error)
    return []
  }
}

export async function getAllFlashcards(): Promise<Flashcard[]> {
  if (!db) {
    console.warn('Firebase não inicializado')
    return []
  }
  
  try {
    const querySnapshot = await getDocs(collection(db, 'flashcards'))
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Flashcard[]
  } catch (error) {
    console.error('Erro ao buscar todos os flashcards:', error)
    return []
  }
}

// Funções para progresso
export async function saveUserProgress(progress: Omit<UserProgress, 'id'>) {
  if (!db) {
    console.warn('Firebase não inicializado')
    return null
  }
  
  try {
    const docRef = await addDoc(collection(db, 'userProgress'), {
      ...progress,
      answeredAt: new Date().toISOString()
    })
    return docRef.id
  } catch (error) {
    console.error('Erro ao salvar progresso:', error)
    return null
  }
}

export async function getUserProgress(userId: string): Promise<UserProgress[]> {
  if (!db) {
    console.warn('Firebase não inicializado')
    return []
  }
  
  try {
    const q = query(collection(db, 'userProgress'), where('userId', '==', userId))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as UserProgress[]
  } catch (error) {
    console.error('Erro ao buscar progresso:', error)
    return []
  }
}

// Função para simular pagamento (para testes)
export async function simulatePaymentApproval(email: string, paymentId: string) {
  if (!db) {
    console.warn('Firebase não inicializado')
    return false
  }
  
  try {
    const payment = await checkPaymentByEmail(email)
    if (payment) {
      const paymentRef = doc(db, 'payments', payment.id!)
      await updateDoc(paymentRef, {
        status: 'approved'
      })
      return true
    }
    return false
  } catch (error) {
    console.error('Erro ao simular aprovação:', error)
    return false
  }
} 

export async function updatePaymentStatus(paymentId: string, status: 'approved' | 'pending' | 'rejected') {
  if (!db) {
    console.warn('Firebase não inicializado')
    return
  }
  
  try {
    const q = query(collection(db, 'payments'), where('payment_id', '==', paymentId))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref
      await updateDoc(docRef, {
        status,
        updated_at: new Date().toISOString()
      })
      console.log('Status do pagamento atualizado:', paymentId, status)
    }
  } catch (error) {
    console.error('Erro ao atualizar status do pagamento:', error)
  }
} 

// Função para criar usuário no Firebase Authentication
export async function createAuthUser(email: string, password: string) {
  if (!auth) {
    console.warn('Firebase Auth não inicializado')
    return null
  }
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error: any) {
    // Se usuário já existe, não é erro
    if (error.code === 'auth/email-already-in-use') {
      console.log('Usuário já existe no Firebase Auth')
      return null
    }
    console.error('Erro ao criar usuário no Auth:', error)
    return null
  }
}

// Função para fazer login no Firebase Authentication
export async function signInUser(email: string, password: string) {
  if (!auth) {
    console.warn('Firebase Auth não inicializado')
    return null
  }
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error: any) {
    console.error('Erro ao fazer login:', error)
    return null
  }
} 