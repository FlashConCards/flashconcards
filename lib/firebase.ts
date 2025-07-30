import { initializeApp } from 'firebase/app'
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth'
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  addDoc,
  Query,
  CollectionReference
} from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// ===== ESTRUTURA ORGANIZADA DO FIREBASE =====
// /users - Usuários registrados
// /admin-users - Usuários criados pelo admin
// /testimonials - Depoimentos
// /courses - Cursos
// /subjects - Matérias
// /topics - Tópicos
// /subtopics - Sub-tópicos
// /flashcards - Flashcards
// /deepenings - Aprofundamentos
// /study-sessions - Sessões de estudo
// /payments - Pagamentos
// /cards - Cards de estudo

// Auth functions
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    console.error('Error signing in:', error)
    throw error
  }
}

// Alias for backward compatibility
export const signInUser = signIn

export const signUp = async (email: string, password: string, displayName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    
    await updateProfile(userCredential.user, {
      displayName: displayName
    })

    // Create user document in /users collection
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: email,
      displayName: displayName,
      photoURL: '',
      isAdmin: false,
      isPaid: false,
      isActive: true,
      studyTime: 0,
      cardsStudied: 0,
      cardsCorrect: 0,
      cardsWrong: 0,
      lastLoginAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return userCredential.user
  } catch (error) {
    console.error('Error signing up:', error)
    throw error
  }
}

// Alias for backward compatibility
export const createUser = signUp

export const signOutUser = async () => {
  try {
    await signOut(auth)
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

// User functions
export const getCurrentUser = () => {
  return auth.currentUser
}

export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback)
}

// Alias for backward compatibility
export { onAuthStateChanged }

// ===== USUÁRIOS REGISTRADOS (/users) =====
export const getAllUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'))
    const users = querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    })) as any[]
    console.log('Users loaded:', users.length)
    return users
  } catch (error: any) {
    console.error('Error getting all users:', error)
    if (error.code === 'permission-denied') {
      console.warn('Permission denied for users collection, returning empty array')
      return []
    }
    throw error
  }
}

export const getUserById = async (uid: string) => {
  try {
    const docRef = doc(db, 'users', uid)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { uid: docSnap.id, ...docSnap.data() }
    } else {
      return null
    }
  } catch (error) {
    console.error('Error getting user by ID:', error)
    return null
  }
}

export const getUserData = async (uid: string) => {
  try {
    const docRef = doc(db, 'users', uid)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { uid: docSnap.id, ...docSnap.data() } as any
    } else {
      return null
    }
  } catch (error) {
    console.error('Error getting user by ID:', error)
    return null
  }
}

export const updateUser = async (uid: string, data: any) => {
  try {
    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

// Alias for backward compatibility
export const updateUserData = updateUser

// ===== USUÁRIOS CRIADOS PELO ADMIN (/admin-users) =====
export const createUserByAdmin = async (userData: any) => {
  try {
    console.log('Creating user by admin:', userData.email)
    
    // Verificar se o email já existe na coleção admin-users
    const adminUsers = await getAllAdminUsers()
    const existingAdminUser = adminUsers.find((u: any) => u.email === userData.email)
    
    if (existingAdminUser) {
      throw new Error('Usuário já existe no sistema')
    }
    
    // Verificar se o email já existe na coleção users
    const regularUsers = await getAllUsers()
    const existingRegularUser = regularUsers.find((u: any) => u.email === userData.email)
    
    if (existingRegularUser) {
      throw new Error('Email já está sendo usado por um usuário registrado')
    }
    
    // Criar apenas o documento na coleção admin-users sem criar no Auth
    const tempUid = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const userDoc = {
      uid: tempUid,
      email: userData.email,
      displayName: userData.displayName,
      photoURL: '',
      isAdmin: userData.isAdmin || false,
      isPaid: userData.isPaid || false,
      isActive: userData.isActive || true,
      studyTime: userData.studyTime || 0,
      cardsStudied: userData.cardsStudied || 0,
      cardsCorrect: userData.cardsCorrect || 0,
      cardsWrong: userData.cardsWrong || 0,
      createdByAdmin: true,
      password: userData.password || '123456', // Senha temporária
      lastLoginAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    await setDoc(doc(db, 'admin-users', tempUid), userDoc)
    console.log('Admin user document created:', tempUid)
    return tempUid
    
  } catch (error) {
    console.error('Error creating user by admin:', error)
    throw error
  }
}

export const deleteUserByAdmin = async (uid: string) => {
  try {
    // Delete from admin-users collection
    await deleteDoc(doc(db, 'admin-users', uid))
    console.log('Admin user deleted:', uid)
  } catch (error) {
    console.error('Error deleting admin user:', error)
    throw error
  }
}

export const getAllAdminUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'admin-users'))
    const adminUsers = querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    })) as any[]
    console.log('Admin users loaded:', adminUsers.length)
    return adminUsers
  } catch (error: any) {
    console.error('Error getting admin users:', error)
    if (error.code === 'permission-denied') {
      console.warn('Permission denied for admin-users collection, returning empty array')
      return []
    }
    throw error
  }
}

// ===== DEPOIMENTOS (/testimonials) =====
export const getTestimonials = async (status?: 'pending' | 'approved' | 'rejected' | 'all') => {
  try {
    let q: Query | CollectionReference = collection(db, 'testimonials')
    
    if (status && status !== 'all') {
      q = query(q, where('status', '==', status))
    }
    
    const querySnapshot = await getDocs(q)
    const testimonials = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[]
    console.log('Testimonials loaded:', testimonials.length)
    return testimonials
  } catch (error: any) {
    console.error('Error getting testimonials:', error)
    if (error.code === 'permission-denied') {
      console.warn('Permission denied for testimonials collection, returning empty array')
      return []
    }
    throw error
  }
}

export const updateTestimonialStatus = async (testimonialId: string, status: 'pending' | 'approved' | 'rejected') => {
  try {
    console.log('Updating testimonial status:', testimonialId, status)
    const testimonialRef = doc(db, 'testimonials', testimonialId)
    await updateDoc(testimonialRef, {
      status: status,
      updatedAt: serverTimestamp()
    })
    console.log('Testimonial status updated successfully')
  } catch (error) {
    console.error('Error updating testimonial status:', error)
    throw error
  }
}

export const createTestimonial = async (testimonialData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'testimonials'), {
      ...testimonialData,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return docRef.id
  } catch (error) {
    console.error('Error creating testimonial:', error)
    throw error
  }
}

// ===== CURSOS (/courses) =====
export const getCourses = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'courses'))
    const courses = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[]
    console.log('Courses loaded:', courses.length)
    return courses
  } catch (error: any) {
    console.error('Error getting courses:', error)
    if (error.code === 'permission-denied') {
      console.warn('Permission denied for courses collection, returning empty array')
      return []
    }
    throw error
  }
}

export const createCourse = async (courseData: any) => {
  try {
    console.log('Creating course:', courseData.name)
    const docRef = await addDoc(collection(db, 'courses'), {
      ...courseData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    console.log('Course created successfully:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error('Error creating course:', error)
    throw error
  }
}

export const deleteCourse = async (courseId: string) => {
  try {
    await deleteDoc(doc(db, 'courses', courseId))
    console.log('Course deleted successfully:', courseId)
  } catch (error) {
    console.error('Error deleting course:', error)
    throw error
  }
}

// ===== MATÉRIAS (/subjects) =====
export const getSubjects = async (courseId?: string) => {
  try {
    let q: Query | CollectionReference = collection(db, 'subjects')
    
    if (courseId) {
      q = query(q, where('courseId', '==', courseId))
    }
    
    const querySnapshot = await getDocs(q)
    const subjects = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[]
    console.log('Subjects loaded:', subjects.length)
    return subjects
  } catch (error: any) {
    console.error('Error getting subjects:', error)
    if (error.code === 'permission-denied') {
      console.warn('Permission denied for subjects collection, returning empty array')
      return []
    }
    throw error
  }
}

export const createSubject = async (subjectData: any) => {
  try {
    console.log('Creating subject:', subjectData.name)
    const docRef = await addDoc(collection(db, 'subjects'), {
      ...subjectData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    console.log('Subject created successfully:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error('Error creating subject:', error)
    throw error
  }
}

export const updateSubject = async (subjectId: string, data: any) => {
  try {
    const subjectRef = doc(db, 'subjects', subjectId)
    await updateDoc(subjectRef, {
      ...data,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating subject:', error)
    throw error
  }
}

export const deleteSubject = async (subjectId: string) => {
  try {
    await deleteDoc(doc(db, 'subjects', subjectId))
  } catch (error) {
    console.error('Error deleting subject:', error)
    throw error
  }
}

// ===== TÓPICOS (/topics) =====
export const getTopics = async (subjectId?: string) => {
  try {
    let q: Query | CollectionReference = collection(db, 'topics')
    
    if (subjectId) {
      q = query(q, where('subjectId', '==', subjectId))
    }
    
    const querySnapshot = await getDocs(q)
    const topics = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[]
    console.log('Topics loaded:', topics.length)
    return topics
  } catch (error: any) {
    console.error('Error getting topics:', error)
    if (error.code === 'permission-denied') {
      console.warn('Permission denied for topics collection, returning empty array')
      return []
    }
    throw error
  }
}

export const createTopic = async (topicData: any) => {
  try {
    console.log('Creating topic:', topicData.name)
    const docRef = await addDoc(collection(db, 'topics'), {
      ...topicData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    console.log('Topic created successfully:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error('Error creating topic:', error)
    throw error
  }
}

export const updateTopic = async (topicId: string, data: any) => {
  try {
    const topicRef = doc(db, 'topics', topicId)
    await updateDoc(topicRef, {
      ...data,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating topic:', error)
    throw error
  }
}

export const deleteTopic = async (topicId: string) => {
  try {
    await deleteDoc(doc(db, 'topics', topicId))
  } catch (error) {
    console.error('Error deleting topic:', error)
    throw error
  }
}

// ===== SUB-TÓPICOS (/subtopics) =====
export const getSubTopics = async (topicId?: string) => {
  try {
    let q: Query | CollectionReference = collection(db, 'subtopics')
    
    if (topicId) {
      q = query(q, where('topicId', '==', topicId))
    }
    
    const querySnapshot = await getDocs(q)
    const subTopics = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[]
    console.log('SubTopics loaded:', subTopics.length)
    return subTopics
  } catch (error: any) {
    console.error('Error getting subTopics:', error)
    if (error.code === 'permission-denied') {
      console.warn('Permission denied for subtopics collection, returning empty array')
      return []
    }
    throw error
  }
}

export const createSubTopic = async (subTopicData: any) => {
  try {
    console.log('Creating subTopic:', subTopicData.name)
    const docRef = await addDoc(collection(db, 'subtopics'), {
      ...subTopicData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    console.log('SubTopic created successfully:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error('Error creating subTopic:', error)
    throw error
  }
}

export const updateSubTopic = async (subTopicId: string, data: any) => {
  try {
    const subTopicRef = doc(db, 'subtopics', subTopicId)
    await updateDoc(subTopicRef, {
      ...data,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating subTopic:', error)
    throw error
  }
}

export const deleteSubTopic = async (subTopicId: string) => {
  try {
    await deleteDoc(doc(db, 'subtopics', subTopicId))
  } catch (error) {
    console.error('Error deleting subTopic:', error)
    throw error
  }
}

// ===== FLASHCARDS (/flashcards) =====
export const getFlashcards = async (subTopicId?: string) => {
  try {
    let q: Query | CollectionReference = collection(db, 'flashcards')
    
    if (subTopicId) {
      q = query(q, where('subTopicId', '==', subTopicId))
    }
    
    const querySnapshot = await getDocs(q)
    const flashcards = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[]
    console.log('Flashcards loaded:', flashcards.length)
    return flashcards
  } catch (error: any) {
    console.error('Error getting flashcards:', error)
    if (error.code === 'permission-denied') {
      console.warn('Permission denied for flashcards collection, returning empty array')
      return []
    }
    throw error
  }
}

// ===== APROFUNDAMENTOS (/deepenings) =====
export const getDeepenings = async (flashcardId?: string) => {
  try {
    let q: Query | CollectionReference = collection(db, 'deepenings')
    
    if (flashcardId) {
      q = query(q, where('flashcardId', '==', flashcardId))
    }
    
    const querySnapshot = await getDocs(q)
    const deepenings = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[]
    console.log('Deepenings loaded:', deepenings.length)
    return deepenings
  } catch (error: any) {
    console.error('Error getting deepenings:', error)
    if (error.code === 'permission-denied') {
      console.warn('Permission denied for deepenings collection, returning empty array')
      return []
    }
    throw error
  }
}

// ===== SESSÕES DE ESTUDO (/study-sessions) =====
export const createStudySession = async (sessionData: any) => {
  try {
    console.log('Creating study session:', sessionData)
    const docRef = await addDoc(collection(db, 'study-sessions'), {
      ...sessionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    console.log('Study session created successfully:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error('Error creating study session:', error)
    throw error
  }
}

// ===== PAGAMENTOS (/payments) =====
export const createPayment = async (paymentData: any) => {
  try {
    console.log('Creating payment:', paymentData)
    const docRef = await addDoc(collection(db, 'payments'), {
      ...paymentData,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    console.log('Payment created successfully:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error('Error creating payment:', error)
    throw error
  }
}

export const updatePaymentStatus = async (paymentId: string, status: string) => {
  try {
    console.log('Updating payment status:', paymentId, status)
    const paymentRef = doc(db, 'payments', paymentId)
    await updateDoc(paymentRef, {
      status: status,
      updatedAt: serverTimestamp()
    })
    console.log('Payment status updated successfully')
  } catch (error) {
    console.error('Error updating payment status:', error)
    throw error
  }
}

// ===== CARDS (/cards) =====
export const getCards = async (category?: string) => {
  try {
    let q: Query | CollectionReference = collection(db, 'cards')
    
    if (category) {
      q = query(q, where('category', '==', category))
    }
    
    const querySnapshot = await getDocs(q)
    const cards = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[]
    console.log('Cards loaded:', cards.length)
    return cards
  } catch (error: any) {
    console.error('Error getting cards:', error)
    if (error.code === 'permission-denied') {
      console.warn('Permission denied for cards collection, returning empty array')
      return []
    }
    throw error
  }
}

// User progress functions
export const updateUserProgress = async (uid: string, progressData: any) => {
  try {
    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, {
      ...progressData,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating user progress:', error)
    throw error
  }
}

export const getUserProgress = async (uid: string) => {
  try {
    const userRef = doc(db, 'users', uid)
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
      const userData = userSnap.data()
      return {
        studyTime: userData.studyTime || 0,
        cardsStudied: userData.cardsStudied || 0,
        cardsCorrect: userData.cardsCorrect || 0,
        cardsWrong: userData.cardsWrong || 0,
        isPaid: userData.isPaid || false,
        isActive: userData.isActive || true
      }
    } else {
      return null
    }
  } catch (error) {
    console.error('Error getting user progress:', error)
    return null
  }
}

// Real-time listeners
export const onUsersChange = (callback: (data: any[]) => void) => {
  try {
    return onSnapshot(collection(db, 'users'), (snapshot) => {
      const users = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as any[]
      console.log('Users real-time update:', users.length)
      callback(users)
    }, (error) => {
      console.error('Error in users listener:', error)
      callback([])
    })
  } catch (error) {
    console.error('Error setting up users listener:', error)
    return () => {}
  }
}

export const onAdminUsersChange = (callback: (data: any[]) => void) => {
  try {
    return onSnapshot(collection(db, 'admin-users'), (snapshot) => {
      const adminUsers = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as any[]
      console.log('Admin users real-time update:', adminUsers.length)
      callback(adminUsers)
    }, (error) => {
      console.error('Error in admin users listener:', error)
      callback([])
    })
  } catch (error) {
    console.error('Error setting up admin users listener:', error)
    return () => {}
  }
}

export const onTestimonialsChange = (callback: (data: any[]) => void) => {
  try {
    return onSnapshot(collection(db, 'testimonials'), (snapshot) => {
      const testimonials = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[]
      console.log('Testimonials real-time update:', testimonials.length)
      callback(testimonials)
    }, (error) => {
      console.error('Error in testimonials listener:', error)
      callback([])
    })
  } catch (error) {
    console.error('Error setting up testimonials listener:', error)
    return () => {}
  }
}

export const onCoursesChange = (callback: (data: any[]) => void) => {
  try {
    return onSnapshot(collection(db, 'courses'), (snapshot) => {
      const courses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[]
      console.log('Courses real-time update:', courses.length)
      callback(courses)
    }, (error) => {
      console.error('Error in courses listener:', error)
      callback([])
    })
  } catch (error) {
    console.error('Error setting up courses listener:', error)
    return () => {}
  }
}

// Storage functions
export const uploadFile = async (file: File, path: string) => {
  try {
    const storageRef = ref(storage, path)
    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)
    return downloadURL
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
} 