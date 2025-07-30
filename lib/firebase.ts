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

    // Create user document in Firestore
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
    // Return empty array if permission denied
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

// Alias for backward compatibility
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

export const deleteUserByAdmin = async (uid: string) => {
  try {
    // Delete from Firestore
    await deleteDoc(doc(db, 'users', uid))
    console.log('User document deleted from Firestore:', uid)
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}

export const createUserByAdmin = async (userData: any) => {
  try {
    console.log('Creating user by admin:', userData.email)
    
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password || '123456' // Default password if not provided
    )

    console.log('User created in Auth:', userCredential.user.uid)

    // Update profile
    await updateProfile(userCredential.user, {
      displayName: userData.displayName
    })

    // Create user document in Firestore
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
      lastLoginAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    await setDoc(doc(db, 'users', userCredential.user.uid), userDoc)
    console.log('User document created in Firestore:', userCredential.user.uid)

    return userCredential.user.uid
  } catch (error) {
    console.error('Error creating user by admin:', error)
    throw error
  }
}

// Testimonial functions
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
    // Return empty array if permission denied
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

// Course functions
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
    // Return empty array if permission denied
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

// Subject functions
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
    // Return empty array if permission denied
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

// Topic functions
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
    // Return empty array if permission denied
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

// SubTopic functions
export const getSubTopics = async (topicId?: string) => {
  try {
    let q: Query | CollectionReference = collection(db, 'subTopics')
    
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
    // Return empty array if permission denied
    if (error.code === 'permission-denied') {
      console.warn('Permission denied for subTopics collection, returning empty array')
      return []
    }
    throw error
  }
}

export const createSubTopic = async (subTopicData: any) => {
  try {
    console.log('Creating subTopic:', subTopicData.name)
    const docRef = await addDoc(collection(db, 'subTopics'), {
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
    const subTopicRef = doc(db, 'subTopics', subTopicId)
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
    await deleteDoc(doc(db, 'subTopics', subTopicId))
  } catch (error) {
    console.error('Error deleting subTopic:', error)
    throw error
  }
}

// Flashcard functions
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
    // Return empty array if permission denied
    if (error.code === 'permission-denied') {
      console.warn('Permission denied for flashcards collection, returning empty array')
      return []
    }
    throw error
  }
}

// Deepening functions
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
    // Return empty array if permission denied
    if (error.code === 'permission-denied') {
      console.warn('Permission denied for deepenings collection, returning empty array')
      return []
    }
    throw error
  }
}

// Study session functions
export const createStudySession = async (sessionData: any) => {
  try {
    console.log('Creating study session:', sessionData)
    const docRef = await addDoc(collection(db, 'studySessions'), {
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
      // Call callback with empty array on error
      callback([])
    })
  } catch (error) {
    console.error('Error setting up users listener:', error)
    // Return empty function if setup fails
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
      // Call callback with empty array on error
      callback([])
    })
  } catch (error) {
    console.error('Error setting up testimonials listener:', error)
    // Return empty function if setup fails
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
      // Call callback with empty array on error
      callback([])
    })
  } catch (error) {
    console.error('Error setting up courses listener:', error)
    // Return empty function if setup fails
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