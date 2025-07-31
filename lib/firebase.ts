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
// /users - Todos os usuários (registrados + admin)
// /courses - Cursos disponíveis
// /subjects - Matérias dos cursos
// /topics - Tópicos das matérias
// /subtopics - Sub-tópicos
// /flashcards - Flashcards de estudo
// /deepenings - Aprofundamentos
// /testimonials - Depoimentos
// /study-sessions - Sessões de estudo
// /payments - Pagamentos

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

export { onAuthStateChanged }

// ===== USUÁRIOS (/users) =====
export const getAllUsers = async () => {
  try {
    console.log('getAllUsers: Starting to fetch users...')
    const usersCollection = collection(db, 'users')
    console.log('getAllUsers: Collection reference created')
    
    const querySnapshot = await getDocs(usersCollection)
    console.log('getAllUsers: Query snapshot received, docs count:', querySnapshot.docs.length)
    
    const users = querySnapshot.docs.map(doc => {
      const userData = {
        uid: doc.id,
        ...doc.data()
      } as any
      console.log('getAllUsers: Processing user:', userData.uid, userData.email)
      return userData
    }) as any[]
    
    console.log('getAllUsers: Final users array length:', users.length)
    console.log('getAllUsers: Users data:', users)
    
    // Se não há usuários no Firestore, vamos verificar se há usuários no Auth
    if (users.length === 0) {
      console.log('getAllUsers: No users found in Firestore, checking if this is a permissions issue...')
    }
    
    return users
  } catch (error: any) {
    console.error('getAllUsers: Error getting all users:', error)
    console.error('getAllUsers: Error code:', error.code)
    console.error('getAllUsers: Error message:', error.message)
    
    // Se é erro de permissão, vamos tentar uma abordagem diferente
    if (error.code === 'permission-denied') {
      console.log('getAllUsers: Permission denied, this might be a Firebase rules issue')
    }
    
    return []
  }
}

// Função para verificar se um email específico existe
export const checkEmailExists = async (email: string) => {
  try {
    console.log('checkEmailExists: Checking email:', email)
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('email', '==', email))
    const querySnapshot = await getDocs(q)
    
    const exists = !querySnapshot.empty
    console.log('checkEmailExists: Email exists:', exists)
    
    if (exists) {
      const userData = querySnapshot.docs[0].data()
      console.log('checkEmailExists: Existing user data:', userData)
    }
    
    return exists
  } catch (error: any) {
    console.error('checkEmailExists: Error checking email:', error)
    return false
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

// ===== CRIAR USUÁRIO PELO ADMIN =====
export const createUserByAdmin = async (userData: any) => {
  try {
    console.log('Creating user by admin:', userData.email)
    
    // Verificar se o email já existe no Firestore primeiro
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('email', '==', userData.email))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      console.log('Email already exists in Firestore:', userData.email)
      throw new Error('Este email já está sendo usado por outro usuário')
    }
    
    // Criar usuário no Firebase Auth primeiro
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password || '123456'
    )

    console.log('User created in Auth:', userCredential.user.uid)

    // Update profile
    await updateProfile(userCredential.user, {
      displayName: userData.displayName
    })

    // Create user document in /users collection
    const userDoc = {
      uid: userCredential.user.uid,
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
      selectedCourse: userData.selectedCourse || '',
      lastLoginAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    await setDoc(doc(db, 'users', userCredential.user.uid), userDoc)
    console.log('Admin user document created:', userCredential.user.uid)

    // IMPORTANTE: Fazer logout do usuário criado para não ficar logado
    await signOut(auth)
    console.log('Logged out from created user to prevent auto-login')

    return userCredential.user.uid
  } catch (error: any) {
    console.error('Error creating user by admin:', error)
    
    // Tratar erro específico de email já existente
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Este email já está sendo usado por outro usuário')
    }
    
    throw error
  }
}

export const deleteUserByAdmin = async (uid: string) => {
  try {
    console.log('deleteUserByAdmin: Starting to delete user:', uid)
    
    // Chamar API route para deletar do Auth e Firestore
    const response = await fetch('/api/admin/delete-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uid }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Erro ao deletar usuário');
    }

    console.log('deleteUserByAdmin: User deleted successfully from Auth and Firestore:', uid)
    console.log('deleteUserByAdmin: Response:', result.message)
    
    return result;
  } catch (error: any) {
    console.error('deleteUserByAdmin: Error deleting user:', error)
    console.error('deleteUserByAdmin: Error code:', error.code)
    console.error('deleteUserByAdmin: Error message:', error.message)
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
    return []
  }
}

export const createCourse = async (courseData: any) => {
  try {
    console.log('=== CREATE COURSE START ===');
    console.log('Course data received:', courseData);
    console.log('Firebase auth state:', auth.currentUser);
    console.log('Firebase project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    
    const docRef = await addDoc(collection(db, 'courses'), {
      ...courseData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    console.log('Course created successfully with ID:', docRef.id);
    console.log('=== CREATE COURSE END ===');
    return docRef.id
  } catch (error: any) {
    console.error('=== CREATE COURSE ERROR ===');
    console.error('Error creating course:', error);
    console.error('Error type:', typeof error);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
    console.error('=== CREATE COURSE ERROR END ===');
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
    return []
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

export const deleteSubject = async (subjectId: string) => {
  try {
    await deleteDoc(doc(db, 'subjects', subjectId))
    console.log('Subject deleted successfully:', subjectId)
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
    return []
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

export const deleteTopic = async (topicId: string) => {
  try {
    await deleteDoc(doc(db, 'topics', topicId))
    console.log('Topic deleted successfully:', topicId)
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
    return []
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

export const deleteSubTopic = async (subTopicId: string) => {
  try {
    await deleteDoc(doc(db, 'subtopics', subTopicId))
    console.log('SubTopic deleted successfully:', subTopicId)
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
    return []
  }
}

export const createFlashcard = async (flashcardData: any) => {
  try {
    console.log('Creating flashcard:', flashcardData)
    const docRef = await addDoc(collection(db, 'flashcards'), {
      ...flashcardData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    console.log('Flashcard created successfully:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error('Error creating flashcard:', error)
    throw error
  }
}

export const deleteFlashcard = async (flashcardId: string) => {
  try {
    await deleteDoc(doc(db, 'flashcards', flashcardId))
    console.log('Flashcard deleted successfully:', flashcardId)
  } catch (error) {
    console.error('Error deleting flashcard:', error)
    throw error
  }
}

// ===== APROFUNDAMENTOS (/deepenings) =====
export const getDeepenings = async (topicId?: string) => {
  try {
    let q: Query | CollectionReference = collection(db, 'deepenings')
    
    if (topicId) {
      q = query(q, where('topicId', '==', topicId))
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
    return []
  }
}

export const createDeepening = async (deepeningData: any) => {
  try {
    const deepeningDoc = {
      topicId: deepeningData.topicId,
      content: deepeningData.content,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
    
    const docRef = await addDoc(collection(db, 'deepenings'), deepeningDoc)
    console.log('Deepening created with ID:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error('Error creating deepening:', error)
    throw error
  }
}

export const deleteDeepening = async (deepeningId: string) => {
  try {
    await deleteDoc(doc(db, 'deepenings', deepeningId))
    console.log('Deepening deleted:', deepeningId)
  } catch (error) {
    console.error('Error deleting deepening:', error)
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
    return []
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

export const updatePaymentStatus = async (paymentId: string, status: 'pending' | 'approved' | 'refunded' | 'failed') => {
  try {
    const paymentRef = doc(db, 'payments', paymentId);
    await updateDoc(paymentRef, {
      status,
      updatedAt: serverTimestamp()
    });
    console.log('Payment status updated:', paymentId, status);
  } catch (error: any) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};



// Buscar pagamentos do usuário
export const getUserPayments = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'payments'),
      where('userId', '==', userId),
      where('status', '==', 'approved')
    )
    const querySnapshot = await getDocs(q)
    const payments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[]
    console.log('User payments loaded:', payments.length)
    return payments
  } catch (error: any) {
    console.error('Error getting user payments:', error)
    return []
  }
}

// Verificar acesso do usuário aos cursos
export const getUserAccessibleCourses = async (userId: string) => {
  try {
    // 1. Buscar dados do usuário para ver permissões do admin
    const userData = await getUserData(userId)
    const adminGrantedCourses: string[] = []
    
    if (userData?.selectedCourse) {
      adminGrantedCourses.push(userData.selectedCourse)
    }

    // 2. Buscar pagamentos aprovados do usuário
    const payments = await getUserPayments(userId)
    const paidCourses: string[] = payments.map(payment => payment.courseId).filter(Boolean)

    // 3. Combinar cursos permitidos pelo admin + cursos comprados
    const allCourseIds = [...adminGrantedCourses, ...paidCourses]
    const accessibleCourseIds = allCourseIds.filter((courseId, index) => 
      allCourseIds.indexOf(courseId) === index
    )
    
    console.log('User accessible courses:', accessibleCourseIds)
    return accessibleCourseIds
  } catch (error: any) {
    console.error('Error getting user accessible courses:', error)
    return []
  }
}

// Buscar cursos com controle de acesso
export const getCoursesWithAccess = async (userId: string) => {
  try {
    // Buscar todos os cursos
    const allCourses = await getCourses()
    
    // Se for admin, retornar todos os cursos
    const userData = await getUserData(userId)
    if (userData?.isAdmin) {
      return allCourses
    }

    // Se não for admin, verificar acesso
    const accessibleCourseIds = await getUserAccessibleCourses(userId)
    
    // Filtrar apenas cursos que o usuário tem acesso
    const accessibleCourses = allCourses?.filter(course => 
      accessibleCourseIds.includes(course.id)
    ) || []

    console.log('Courses with access control:', accessibleCourses.length)
    return accessibleCourses
  } catch (error: any) {
    console.error('Error getting courses with access:', error)
    return []
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
    console.log('=== UPLOAD FILE START ===');
    console.log('File:', file.name, 'Size:', file.size, 'Type:', file.type);
    console.log('Path:', path);
    console.log('Storage bucket:', storage.app.options.storageBucket);
    
    const storageRef = ref(storage, path);
    console.log('Storage reference created');
    
    const snapshot = await uploadBytes(storageRef, file);
    console.log('Upload completed, getting download URL...');
    
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Download URL:', downloadURL);
    console.log('=== UPLOAD FILE END ===');
    
    return downloadURL
  } catch (error: any) {
    console.error('=== UPLOAD FILE ERROR ===');
    console.error('Error uploading file:', error);
    console.error('Error type:', typeof error);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
    console.error('=== UPLOAD FILE ERROR END ===');
    throw error
  }
}

// Aliases for backward compatibility
export const signInUser = signIn
export const createUser = signUp
export const updateUserData = updateUser 