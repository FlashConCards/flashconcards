import { initializeApp } from 'firebase/app'
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
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
import { Course, Post } from '@/types'

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

// Configurar persistência de sessão para 7 dias
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('Firebase Auth persistence set to local')
  })
  .catch((error) => {
    console.error('Error setting Firebase Auth persistence:', error)
  })

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

// Nova função createUser que aceita objeto userData
export const createUser = async (email: string, password: string, userData: any) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    
    await updateProfile(userCredential.user, {
      displayName: userData.displayName
    })

    // Create user document in /users collection
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: email,
      displayName: userData.displayName,
      photoURL: userData.photoURL || '',
      isAdmin: userData.isAdmin || false,
      isPaid: userData.isPaid || false,
      isActive: userData.isActive || true,
      studyTime: userData.studyTime || 0,
      cardsStudied: userData.cardsStudied || 0,
      cardsCorrect: userData.cardsCorrect || 0,
      cardsWrong: userData.cardsWrong || 0,
      lastLoginAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return userCredential.user
  } catch (error) {
    console.error('Error creating user:', error)
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
      isModerator: userData.isModerator || false,
      isTeacher: userData.isTeacher || false,
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

    // Enviar email de boas-vindas se o usuário tem acesso a um curso
    if (userData.selectedCourse) {
      try {
        const course = await getCourseById(userData.selectedCourse)
        if (course) {
          // Chamar API para enviar email
          const response = await fetch('/api/admin/send-welcome-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userName: userData.displayName,
              userEmail: userData.email,
              courseName: course.name,
              userPassword: userData.password || '123456'
            })
          })

          if (response.ok) {
            console.log('Welcome email sent to:', userData.email)
          } else {
            console.error('Failed to send welcome email')
          }
        }
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError)
        // Não falhar a criação do usuário se o email falhar
      }
    }

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
      expirationMonths: courseData.expirationMonths || 6, // Padrão: 6 meses
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

export const updateCourse = async (courseId: string, courseData: any) => {
  try {
    console.log('Updating course:', courseId, courseData)
    await updateDoc(doc(db, 'courses', courseId), {
      ...courseData,
      updatedAt: serverTimestamp()
    })
    console.log('Course updated successfully:', courseId)
  } catch (error) {
    console.error('Error updating course:', error)
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

export const updateSubject = async (subjectId: string, subjectData: any) => {
  try {
    console.log('Updating subject:', subjectId, subjectData)
    await updateDoc(doc(db, 'subjects', subjectId), {
      ...subjectData,
      updatedAt: serverTimestamp()
    })
    console.log('Subject updated successfully:', subjectId)
  } catch (error) {
    console.error('Error updating subject:', error)
    throw error
  }
}

// ===== TÓPICOS (/topics) =====
export const getTopics = async (subjectId?: string) => {
  try {
    console.log('getTopics called with subjectId:', subjectId)
    let q: Query | CollectionReference = collection(db, 'topics')
    
    if (subjectId) {
      q = query(q, where('subjectId', '==', subjectId))
      console.log('Query created with filter for subjectId:', subjectId)
    } else {
      q = query(q)
      console.log('Query created without filter')
    }
    
    const querySnapshot = await getDocs(q)
    console.log('Query snapshot size:', querySnapshot.size)
    
    const topics = querySnapshot.docs.map(doc => {
      const data = doc.data()
      console.log('Topic document:', doc.id, data)
      return {
        id: doc.id,
        ...data
      }
    }) as any[]
    
    console.log('Topics loaded:', topics.length)
    console.log('Topics data:', topics)
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

export const updateTopic = async (topicId: string, topicData: any) => {
  try {
    console.log('Updating topic:', topicId, topicData)
    await updateDoc(doc(db, 'topics', topicId), {
      ...topicData,
      updatedAt: serverTimestamp()
    })
    console.log('Topic updated successfully:', topicId)
  } catch (error) {
    console.error('Error updating topic:', error)
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
      q = query(q, where('topicId', '==', topicId), orderBy('createdAt', 'asc'))
    } else {
      q = query(q, orderBy('createdAt', 'asc'))
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

export const updateSubTopic = async (subTopicId: string, subTopicData: any) => {
  try {
    console.log('Updating subTopic:', subTopicId, subTopicData)
    await updateDoc(doc(db, 'subtopics', subTopicId), {
      ...subTopicData,
      updatedAt: serverTimestamp()
    })
    console.log('SubTopic updated successfully:', subTopicId)
  } catch (error) {
    console.error('Error updating subTopic:', error)
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
    console.log('Getting flashcards for subTopicId:', subTopicId)
    let q: Query | CollectionReference = collection(db, 'flashcards')
    
    if (subTopicId) {
      // Corrigido: buscar por subTopicId, não topicId
      q = query(q, where('subTopicId', '==', subTopicId))
      console.log('Query created with filter for subTopicId:', subTopicId)
    }
    
    const querySnapshot = await getDocs(q)
    console.log('Query snapshot size:', querySnapshot.size)
    
        const flashcards = querySnapshot.docs.map(doc => {
      const data = doc.data()
      console.log('Document data:', doc.id, data)
      console.log('Document fields:', {
        id: doc.id,
        front: data.front,
        back: data.back,
        question: data.question,
        answer: data.answer,
        explanation: data.explanation,
        subTopicId: data.subTopicId,
        order: data.order,
        isActive: data.isActive
      })
      
      // Verificar se os campos estão vazios
      if (!data.front && !data.question) {
        console.error('Flashcard sem pergunta:', doc.id, data);
      }
      if (!data.back && !data.answer) {
        console.error('Flashcard sem resposta:', doc.id, data);
      }
      
          // Verificar se os campos estão sendo salvos corretamente
    console.log('Document fields check:', {
      id: doc.id,
      hasFront: !!data.front,
      hasBack: !!data.back,
      hasQuestion: !!data.question,
      hasAnswer: !!data.answer,
      frontLength: data.front?.length || 0,
      backLength: data.back?.length || 0,
      frontValue: data.front,
      backValue: data.back,
      frontType: typeof data.front,
      backType: typeof data.back,
      allFields: Object.keys(data),
      dataKeys: Object.keys(data),
      dataValues: Object.values(data),
      dataEntries: Object.entries(data),
      dataStringified: JSON.stringify(data, null, 2),
      dataRaw: data,
      dataNull: data === null,
      dataUndefined: data === undefined,
      dataEmpty: Object.keys(data).length === 0,
      dataHasSubTopicId: !!data.subTopicId,
      dataHasFront: !!data.front,
      dataHasBack: !!data.back,
      dataFrontEmpty: data.front === '',
      dataBackEmpty: data.back === '',
      dataFrontNull: data.front === null,
      dataBackNull: data.back === null,
      dataFrontUndefined: data.front === undefined,
      dataBackUndefined: data.back === undefined,
      dataFrontTruthy: !!data.front,
      dataBackTruthy: !!data.back,
      dataFrontLength: data.front?.length || 0,
      dataBackLength: data.back?.length || 0,
      dataFrontString: String(data.front),
      dataBackString: String(data.back),
      dataFrontTrimmed: data.front?.trim(),
      dataBackTrimmed: data.back?.trim(),
      dataFrontTrimmedLength: data.front?.trim()?.length || 0,
      dataBackTrimmedLength: data.back?.trim()?.length || 0,
      dataFrontTrimmedTruthy: !!data.front?.trim(),
      dataBackTrimmedTruthy: !!data.back?.trim(),
      dataFrontTrimmedEmpty: data.front?.trim() === '',
      dataBackTrimmedEmpty: data.back?.trim() === ''
    });
      
      return {
        id: doc.id,
        ...data
      }
    }) as any[]
    
    console.log('Flashcards loaded:', flashcards.length)
    console.log('Flashcards data:', flashcards)
    console.log('First flashcard structure:', flashcards[0])
    
    // Verificar se os campos estão presentes
    flashcards.forEach((flashcard, index) => {
      console.log(`Flashcard ${index}:`, {
        id: flashcard.id,
        front: flashcard.front,
        back: flashcard.back,
        question: flashcard.question,
        answer: flashcard.answer,
        explanation: flashcard.explanation,
        subTopicId: flashcard.subTopicId,
        order: flashcard.order,
        isActive: flashcard.isActive
      })
      
      // Verificar se os campos estão vazios
      if (!flashcard.front && !flashcard.question) {
        console.error(`Flashcard ${index} sem pergunta:`, flashcard);
      }
      if (!flashcard.back && !flashcard.answer) {
        console.error(`Flashcard ${index} sem resposta:`, flashcard);
      }
    })
    
    return flashcards
  } catch (error: any) {
    console.error('Error getting flashcards:', error)
    return []
  }
}

export const createFlashcard = async (flashcardData: any) => {
  try {
    console.log('Creating flashcard:', flashcardData)
    console.log('Flashcard data structure:', {
      front: flashcardData.front,
      back: flashcardData.back,
      explanation: flashcardData.explanation,
      topicId: flashcardData.topicId,
      order: flashcardData.order,
      isActive: flashcardData.isActive
    })
    
    // Verificar se os dados estão sendo passados corretamente
    if (!flashcardData.front || flashcardData.front.length === 0) {
      console.error('Campo front está vazio:', flashcardData);
      throw new Error('Campo front não pode estar vazio');
    }
    
    if (!flashcardData.back || flashcardData.back.length === 0) {
      console.error('Campo back está vazio:', flashcardData);
      throw new Error('Campo back não pode estar vazio');
    }
    
    const flashcardDoc = {
      front: flashcardData.front || '',
      back: flashcardData.back || '',
      explanation: flashcardData.explanation || '',
      subTopicId: flashcardData.subTopicId || flashcardData.topicId, // Corrigido: usar subTopicId
      order: flashcardData.order || 1,
      isActive: flashcardData.isActive !== false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    // Verificar se os campos estão sendo salvos corretamente
    console.log('Flashcard document structure:', {
      front: flashcardDoc.front,
      back: flashcardDoc.back,
      explanation: flashcardDoc.explanation,
      topicId: flashcardDoc.topicId,
      order: flashcardDoc.order,
      isActive: flashcardDoc.isActive,
      frontLength: flashcardDoc.front.length,
      backLength: flashcardDoc.back.length,
      frontType: typeof flashcardDoc.front,
      backType: typeof flashcardDoc.back,
      allFields: Object.keys(flashcardDoc),
      docKeys: Object.keys(flashcardDoc),
      docValues: Object.values(flashcardDoc),
      docEntries: Object.entries(flashcardDoc),
      docStringified: JSON.stringify(flashcardDoc, null, 2),
      docRaw: flashcardDoc,
      docNull: flashcardDoc === null,
      docUndefined: flashcardDoc === undefined,
      docEmpty: Object.keys(flashcardDoc).length === 0,
      docHasTopicId: !!flashcardDoc.topicId,
      docHasFront: !!flashcardDoc.front,
      docHasBack: !!flashcardDoc.back,
      docFrontEmpty: flashcardDoc.front === '',
      docBackEmpty: flashcardDoc.back === '',
      docFrontNull: flashcardDoc.front === null,
      docBackNull: flashcardDoc.back === null,
      docFrontUndefined: flashcardDoc.front === undefined,
      docBackUndefined: flashcardDoc.back === undefined,
      docFrontTruthy: !!flashcardDoc.front,
      docBackTruthy: !!flashcardDoc.back,
      docFrontLength: flashcardDoc.front?.length || 0,
      docBackLength: flashcardDoc.back?.length || 0,
      docFrontString: String(flashcardDoc.front),
      docBackString: String(flashcardDoc.back),
      docFrontTrimmed: flashcardDoc.front?.trim(),
      docBackTrimmed: flashcardDoc.back?.trim(),
      docFrontTrimmedLength: flashcardDoc.front?.trim()?.length || 0,
      docBackTrimmedLength: flashcardDoc.back?.trim()?.length || 0,
      docFrontTrimmedTruthy: !!flashcardDoc.front?.trim(),
      docBackTrimmedTruthy: !!flashcardDoc.back?.trim(),
      docFrontTrimmedEmpty: flashcardDoc.front?.trim() === '',
      docBackTrimmedEmpty: flashcardDoc.back?.trim() === ''
    });
    
    console.log('Flashcard document to save:', flashcardDoc)
    
    // Verificar se os campos estão vazios antes de salvar
    if (!flashcardDoc.front || flashcardDoc.front.length === 0) {
      throw new Error('Campo front não pode estar vazio');
    }
    
    if (!flashcardDoc.back || flashcardDoc.back.length === 0) {
      throw new Error('Campo back não pode estar vazio');
    }
    
    const docRef = await addDoc(collection(db, 'flashcards'), flashcardDoc)
    console.log('Flashcard created successfully:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error('Error creating flashcard:', error)
    throw error
  }
}

export const updateFlashcard = async (flashcardId: string, flashcardData: any) => {
  try {
    console.log('Updating flashcard:', flashcardId, flashcardData)
    await updateDoc(doc(db, 'flashcards', flashcardId), {
      ...flashcardData,
      updatedAt: serverTimestamp()
    })
    console.log('Flashcard updated successfully:', flashcardId)
  } catch (error) {
    console.error('Error updating flashcard:', error)
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
export const getDeepenings = async (subTopicId?: string) => {
  try {
    let q: Query | CollectionReference = collection(db, 'deepenings')
    
    if (subTopicId) {
      q = query(q, where('subTopicId', '==', subTopicId))
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

export const getDeepeningsBySubTopic = async (subTopicId?: string) => {
  try {
    let q: Query | CollectionReference = collection(db, 'deepenings')
    
    if (subTopicId) {
      q = query(q, where('subTopicId', '==', subTopicId))
    }
    
    const querySnapshot = await getDocs(q)
    const deepenings = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[]
    console.log('Deepenings by subTopic loaded:', deepenings.length)
    return deepenings
  } catch (error: any) {
    console.error('Error getting deepenings by subTopic:', error)
    return []
  }
}

export const createDeepening = async (deepeningData: any) => {
  try {
    console.log('Creating deepening:', deepeningData);
    
    const deepeningDoc = {
      subTopicId: deepeningData.subTopicId,
      title: deepeningData.title || 'Aprofundamento',
      content: deepeningData.content,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
    
    console.log('Deepening document to save:', deepeningDoc);
    
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

export const updateDeepening = async (deepeningId: string, deepeningData: any) => {
  try {
    console.log('Updating deepening:', deepeningId, deepeningData)
    const deepeningRef = doc(db, 'deepenings', deepeningId)
    await updateDoc(deepeningRef, {
      ...deepeningData,
      updatedAt: serverTimestamp()
    })
    console.log('Deepening updated successfully')
  } catch (error) {
    console.error('Error updating deepening:', error)
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

export const deleteTestimonial = async (testimonialId: string) => {
  try {
    console.log('Deleting testimonial:', testimonialId)
    await deleteDoc(doc(db, 'testimonials', testimonialId))
    console.log('Testimonial deleted successfully:', testimonialId)
  } catch (error) {
    console.error('Error deleting testimonial:', error)
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

// ===== AVALIAÇÕES DE CURSOS (/course-ratings) =====
export const getCourseRatings = async (courseId?: string) => {
  try {
    let q: Query | CollectionReference = collection(db, 'course-ratings')
    
    if (courseId) {
      q = query(q, where('courseId', '==', courseId))
    }
    
    const querySnapshot = await getDocs(q)
    const ratings = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[]
    console.log('Course ratings loaded:', ratings.length)
    return ratings
  } catch (error: any) {
    console.error('Error getting course ratings:', error)
    return []
  }
}

export const createCourseRating = async (ratingData: any) => {
  try {
    console.log('Creating course rating:', ratingData)
    const docRef = await addDoc(collection(db, 'course-ratings'), {
      ...ratingData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    console.log('Course rating created successfully:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error('Error creating course rating:', error)
    throw error
  }
}

export const updateCourseRating = async (ratingId: string, ratingData: any) => {
  try {
    console.log('Updating course rating:', ratingId, ratingData)
    const ratingRef = doc(db, 'course-ratings', ratingId)
    await updateDoc(ratingRef, {
      ...ratingData,
      updatedAt: serverTimestamp()
    })
    console.log('Course rating updated successfully')
  } catch (error) {
    console.error('Error updating course rating:', error)
    throw error
  }
}

export const deleteCourseRating = async (ratingId: string) => {
  try {
    console.log('Deleting course rating:', ratingId)
    await deleteDoc(doc(db, 'course-ratings', ratingId))
    console.log('Course rating deleted successfully')
  } catch (error) {
    console.error('Error deleting course rating:', error)
    throw error
  }
}

export const getUserCourseRating = async (userId: string, courseId: string) => {
  try {
    const q = query(
      collection(db, 'course-ratings'),
      where('userId', '==', userId),
      where('courseId', '==', courseId)
    )
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      return {
        id: doc.id,
        ...doc.data()
      }
    }
    return null
  } catch (error) {
    console.error('Error getting user course rating:', error)
    return null
  }
}

export const getCourseAverageRating = async (courseId: string) => {
  try {
    const ratings = await getCourseRatings(courseId)
    if (ratings.length === 0) return 0
    
    const totalRating = ratings.reduce((sum, rating) => sum + (rating.rating || 0), 0)
    return totalRating / ratings.length
  } catch (error) {
    console.error('Error calculating average rating:', error)
    return 0
  }
}

// ===== COMENTÁRIOS DE CURSOS (/course-comments) =====
export const getCourseComments = async (courseId?: string) => {
  try {
    let q: Query | CollectionReference = collection(db, 'course-comments')
    
    if (courseId) {
      q = query(q, where('courseId', '==', courseId), orderBy('createdAt', 'desc'))
    } else {
      q = query(q, orderBy('createdAt', 'desc'))
    }
    
    const querySnapshot = await getDocs(q)
    const comments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[]
    console.log('Course comments loaded:', comments.length)
    return comments
  } catch (error: any) {
    console.error('Error getting course comments:', error)
    return []
  }
}

export const createCourseComment = async (commentData: any) => {
  try {
    console.log('Creating course comment:', commentData)
    const docRef = await addDoc(collection(db, 'course-comments'), {
      ...commentData,
      status: 'approved', // Comentários de cursos são aprovados automaticamente
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    console.log('Course comment created successfully:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error('Error creating course comment:', error)
    throw error
  }
}

export const deleteCourseComment = async (commentId: string) => {
  try {
    console.log('Deleting course comment:', commentId)
    await deleteDoc(doc(db, 'course-comments', commentId))
    console.log('Course comment deleted successfully')
  } catch (error) {
    console.error('Error deleting course comment:', error)
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

    // Se o pagamento foi aprovado, enviar email de boas-vindas
    if (status === 'approved') {
      try {
        const paymentDoc = await getDoc(paymentRef);
        const paymentData = paymentDoc.data();
        
        if (paymentData) {
          const userData = await getUserData(paymentData.userId);
          const course = await getCourseById(paymentData.courseId);
          
          if (userData && course) {
            // Chamar API para enviar email
            try {
              const response = await fetch('/api/admin/send-welcome-email', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  userName: userData.displayName,
                  userEmail: userData.email,
                  courseName: course.name,
                  userPassword: '123456'
                })
              })

              if (response.ok) {
                console.log('Welcome email sent for approved payment to:', userData.email);
              } else {
                console.error('Failed to send welcome email for payment');
              }
            } catch (emailError) {
              console.error('Error calling email API:', emailError);
            }
          }
        }
      } catch (emailError) {
        console.error('Error sending welcome email for payment:', emailError);
        // Não falhar a atualização do pagamento se o email falhar
      }
    }
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
    
    // Verificar se o usuário tem acesso (pago OU admin OU criado pelo admin)
    if (!userData || (!userData.isPaid && !userData.isAdmin && !userData.createdByAdmin)) {
      console.log('User does not have access for accessible courses:', userId);
      return [];
    }
    
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

// Buscar todos os cursos disponíveis para compra (públicos)
export const getPublicCourses = async () => {
  try {
    const allCourses = await getCourses();
    // Filtrar apenas cursos ativos e disponíveis para compra
    const publicCourses = allCourses.filter(course => 
      course.isActive !== false && course.isPublic !== false
    );
    console.log('Public courses loaded:', publicCourses.length);
    return publicCourses;
  } catch (error: any) {
    console.error('Error getting public courses:', error);
    return [];
  }
}

// Buscar cursos com controle de acesso
export const getCoursesWithAccess = async (userId: string) => {
  try {
    console.log('🔍 getCoursesWithAccess chamada para usuário:', userId);
    
    // Buscar dados do usuário
    const userData = await getUserData(userId);
    console.log('👤 Dados do usuário:', {
      uid: userData?.uid,
      email: userData?.email,
      isPaid: userData?.isPaid,
      isAdmin: userData?.isAdmin,
      selectedCourse: userData?.selectedCourse,
      createdByAdmin: userData?.createdByAdmin
    });
    
    // Verificar se o usuário existe
    if (!userData) {
      console.log('❌ Usuário não encontrado:', userId);
      return [];
    }
    
    // Verificar se o usuário tem acesso (pago OU admin OU criado pelo admin)
    const hasAccess = userData.isPaid || userData.isAdmin || userData.createdByAdmin;
    
    if (!hasAccess) {
      console.log('❌ Usuário não tem acesso:', userId);
      return [];
    }
    
    // Verificar expiração do acesso
    if (userData.courseAccessExpiry) {
      const expiryDate = userData.courseAccessExpiry.toDate();
      const currentDate = new Date();
      
      if (currentDate > expiryDate) {
        // Acesso expirou, remover curso selecionado
        await updateUser(userId, {
          selectedCourse: '',
          isPaid: false
        });
        console.log('❌ Acesso expirou, removido curso selecionado');
        return [];
      }
    }

    // Se o usuário tem um curso selecionado, retornar apenas esse curso
    if (userData.selectedCourse) {
      console.log('📚 Buscando curso selecionado:', userData.selectedCourse);
      const courseData = await getCourseById(userData.selectedCourse);
      if (courseData) {
        console.log('✅ Curso encontrado:', courseData.name);
        return [courseData];
      } else {
        console.log('❌ Curso selecionado não encontrado:', userData.selectedCourse);
      }
    }

    // Se não tem curso selecionado e é admin, retornar todos os cursos
    if (userData.isAdmin) {
      console.log('👑 Usuário é admin, retornando todos os cursos');
      const allCourses = await getCourses();
      return allCourses || [];
    }

    // Se não tem curso selecionado e não é admin, não retornar nada
    console.log('❌ Usuário não tem curso selecionado e não é admin:', userId);
    return [];
  } catch (error) {
    console.error('❌ Erro em getCoursesWithAccess:', error);
    return [];
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
    
    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Tipo de arquivo não suportado. Use apenas imagens (JPEG, PNG, GIF, WebP).');
    }
    
    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('Arquivo muito grande. Tamanho máximo: 5MB.');
    }
    
    // Usar API route para contornar CORS
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro no upload');
    }
    
    const result = await response.json();
    console.log('Upload completed via API route');
    console.log('Download URL:', result.url);
    console.log('=== UPLOAD FILE END ===');
    
    return result.url;
  } catch (error: any) {
    console.error('=== UPLOAD FILE ERROR ===');
    console.error('Error uploading file:', error);
    console.error('Error type:', typeof error);
    console.error('Error message:', error.message);
    console.error('=== UPLOAD FILE ERROR END ===');
    throw error;
  }
}

// Aliases for backward compatibility
export const signInUser = signIn
export const updateUserData = updateUser 

// Verificar se o acesso do usuário expirou
export const checkUserAccessExpiry = async (userId: string) => {
  try {
    const userData = await getUserData(userId);
    if (!userData || !userData.courseAccessExpiry) {
      return false; // Sem data de expiração = acesso válido
    }

    const expiryDate = userData.courseAccessExpiry.toDate();
    const currentDate = new Date();
    
    return currentDate > expiryDate; // true se expirou
  } catch (error) {
    console.error('Error checking user access expiry:', error);
    return false;
  }
}

// Calcular data de expiração baseada no curso
export const calculateAccessExpiry = (expirationMonths: number) => {
  const currentDate = new Date();
  const expiryDate = new Date(currentDate);
  expiryDate.setMonth(expiryDate.getMonth() + expirationMonths);
  return expiryDate;
} 

export const getCourseById = async (courseId: string) => {
  try {
    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    
    if (courseSnap.exists()) {
      return {
        id: courseSnap.id,
        ...courseSnap.data()
      } as Course;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting course by ID:', error);
    return null;
  }
}

export const getUserStudySessions = async (uid: string) => {
  try {
    const q = query(
      collection(db, 'study-sessions'),
      where('uid', '==', uid),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error: any) {
    console.error('Error getting user study sessions:', error)
    return []
  }
}

export const getStudySessions = async (uid: string) => {
  try {
    const q = query(
      collection(db, 'study-sessions'),
      where('uid', '==', uid),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error: any) {
    console.error('Error getting study sessions:', error)
    return []
  }
}

export const getUserProgressBySubTopic = async (uid: string, subTopicId: string) => {
  try {
    console.log('Getting progress for user:', uid, 'subTopic:', subTopicId);
    
    // Buscar flashcards do sub-tópico
    const flashcards = await getFlashcards(subTopicId);
    const totalCards = flashcards.length;
    console.log('Total flashcards found:', totalCards);
    
    // Buscar sessões de estudo do usuário para este sub-tópico
    const q = query(
      collection(db, 'study-sessions'),
      where('uid', '==', uid),
      where('subTopicId', '==', subTopicId)
    )
    const querySnapshot = await getDocs(q)
    const sessions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[]
    
    console.log('Study sessions found:', sessions.length);
    console.log('Sessions data:', sessions);
    
    // Calcular progresso baseado em cards únicos estudados
    let studiedCards = 0;
    let correctCards = 0;
    let wrongCards = 0;
    let studyTime = 0;
    
    if (sessions.length > 0) {
      // Usar a sessão mais recente para o progresso atual
      const latestSession = sessions[0]; // Já ordenado por createdAt desc
      
      // Calcular total de cards estudados nesta sessão
      const sessionStudiedCards = (latestSession.correctCards || 0) + (latestSession.wrongCards || 0);
      
      // O progresso deve ser baseado no número de cards únicos estudados
      // Se o usuário estudou todos os cards disponíveis, mostrar como completo
      if (sessionStudiedCards >= totalCards) {
        studiedCards = totalCards;
        correctCards = Math.min(latestSession.correctCards || 0, totalCards);
        wrongCards = Math.min(latestSession.wrongCards || 0, totalCards);
      } else {
        // Se não estudou todos, mostrar o progresso real
        studiedCards = Math.min(sessionStudiedCards, totalCards);
        correctCards = Math.min(latestSession.correctCards || 0, studiedCards);
        wrongCards = Math.min(latestSession.wrongCards || 0, studiedCards);
      }
      
      studyTime = latestSession.studyTime || 0;
      
      console.log('Progress calculation:', {
        sessionId: latestSession.id,
        sessionCorrectCards: latestSession.correctCards,
        sessionWrongCards: latestSession.wrongCards,
        sessionStudiedCards,
        totalCards,
        finalStudiedCards: studiedCards,
        finalCorrectCards: correctCards,
        finalWrongCards: wrongCards
      });
    }
    
    const result = {
      totalCards,
      studiedCards,
      correctCards,
      wrongCards,
      studyTime,
      accuracy: studiedCards > 0 ? (correctCards / studiedCards) * 100 : 0,
      lastStudied: sessions.length > 0 ? sessions[0].createdAt : null
    };
    
    console.log('Progress result:', result);
    return result;
  } catch (error: any) {
    console.error('Error getting user progress by sub-topic:', error)
    return {
      totalCards: 0,
      studiedCards: 0,
      correctCards: 0,
      wrongCards: 0,
      studyTime: 0,
      accuracy: 0,
      lastStudied: null
    }
  }
}

// Invoice functions
export const createInvoice = async (invoiceData: any) => {
  try {
    console.log('Creating invoice:', invoiceData.invoiceNumber);
    
    const docRef = await addDoc(collection(db, 'invoices'), {
      ...invoiceData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('Invoice created with ID:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    throw error;
  }
}

export const getInvoiceById = async (invoiceId: string) => {
  try {
    const docRef = doc(db, 'invoices', invoiceId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      return null;
    }
  } catch (error: any) {
    console.error('Error getting invoice:', error);
    return null;
  }
}

export const getInvoicesByUserId = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'invoices'),
      where('userId', '==', userId),
      orderBy('issueDate', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error: any) {
    console.error('Error getting user invoices:', error);
    return [];
  }
}

export const getPaymentById = async (paymentId: string) => {
  try {
    const q = query(
      collection(db, 'payments'),
      where('paymentId', '==', paymentId)
    );
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    }
    return null;
  } catch (error: any) {
    console.error('Error getting payment:', error);
    return null;
  }
}

// ===== FEED SOCIAL FUNCTIONS =====

export const createPost = async (postData: any) => {
  try {
    let imageUrl = '';
    if (postData.image) {
      imageUrl = await uploadFile(postData.image, `posts/${Date.now()}_${postData.image.name}`);
    }

    const postDoc = await addDoc(collection(db, 'posts'), {
      content: postData.content,
      authorId: postData.authorId,
      authorName: postData.authorName,
      authorEmail: postData.authorEmail,
      authorPhotoURL: postData.authorPhotoURL,
      authorRole: postData.authorRole,
      isOfficial: postData.isOfficial || false,
      imageUrl,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      likes: [],
      comments: []
    })
    return { id: postDoc.id, ...postData, imageUrl }
  } catch (error) {
    console.error('Error creating post:', error)
    throw error
  }
}

export const getPosts = async (): Promise<Post[]> => {
  try {
    const postsQuery = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(postsQuery)
    const posts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Post[]
    return posts
  } catch (error) {
    console.error('Error getting posts:', error)
    return []
  }
}

export const likePost = async (postId: string, userId: string) => {
  try {
    const postRef = doc(db, 'posts', postId)
    const postDoc = await getDoc(postRef)
    
    if (postDoc.exists()) {
      const post = postDoc.data()
      const likes = post.likes || []
      
      if (likes.includes(userId)) {
        // Unlike
        const updatedLikes = likes.filter((id: string) => id !== userId)
        await updateDoc(postRef, { likes: updatedLikes })
      } else {
        // Like
        await updateDoc(postRef, { likes: [...likes, userId] })
      }
    }
  } catch (error) {
    console.error('Error liking post:', error)
    throw error
  }
}

export const commentPost = async (postId: string, commentData: any) => {
  try {
    console.log('Adding comment to post:', postId, commentData);
    
    let imageUrl = '';
    if (commentData.image) {
      console.log('Uploading comment image...');
      imageUrl = await uploadFile(commentData.image, `comments/${Date.now()}_${commentData.image.name}`);
      console.log('Comment image uploaded:', imageUrl);
    }

    const postRef = doc(db, 'posts', postId)
    const postDoc = await getDoc(postRef)
    
    if (postDoc.exists()) {
      const post = postDoc.data()
      const comments = post.comments || []
      
      const newComment = {
        id: Date.now().toString(),
        content: commentData.content,
        authorId: commentData.authorId,
        authorName: commentData.authorName,
        authorPhotoURL: commentData.authorPhotoURL || '',
        authorRole: commentData.authorRole,
        imageUrl,
        createdAt: new Date() // Usar Date normal para evitar problemas com serverTimestamp
      }
      
      console.log('Adding comment:', newComment);
      
      await updateDoc(postRef, { 
        comments: [...comments, newComment],
        updatedAt: serverTimestamp()
      })
      
      console.log('Comment added successfully');
      return newComment
    } else {
      console.error('Post not found:', postId);
      throw new Error('Post não encontrado');
    }
  } catch (error) {
    console.error('Error commenting post:', error)
    throw error
  }
} 

// ===== USER MANAGEMENT FUNCTIONS =====

export const updateUserRole = async (uid: string, role: 'admin' | 'moderator' | 'teacher' | 'user') => {
  try {
    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, {
      isAdmin: role === 'admin',
      isModerator: role === 'moderator',
      isTeacher: role === 'teacher',
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating user role:', error)
    throw error
  }
}

export const updateUserPhoto = async (uid: string, photoFile: File) => {
  try {
    const photoURL = await uploadFile(photoFile, `profiles/${uid}_${Date.now()}_${photoFile.name}`);
    
    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, {
      photoURL,
      updatedAt: serverTimestamp()
    })
    
    return photoURL
  } catch (error) {
    console.error('Error updating user photo:', error)
    throw error
  }
}

// Função para verificar se o usuário pode editar/excluir um item
export const canUserEditItem = async (userId: string, itemAuthorId: string, userRole: string) => {
  // Admin e moderadores podem editar tudo
  if (userRole === 'admin' || userRole === 'moderator') {
    return true;
  }
  
  // Professores só podem editar o que eles criaram
  if (userRole === 'teacher') {
    return userId === itemAuthorId;
  }
  
  // Usuários comuns não podem editar nada
  return false;
} 