import { initializeApp } from 'firebase/app'
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile,
  updatePassword,
  onAuthStateChanged,
  User
} from 'firebase/auth'
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore'
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage'

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCdmLKwFLOXtf9Ent34KhQbZ3RVkhvmU5A",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "flashconcards-4a5d4.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "flashconcards-4a5d4",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "flashconcards-4a5d4.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "178554282805",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:178554282805:web:757d1cf8e979faac18a27c",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Export Firebase functions
export { onAuthStateChanged } from 'firebase/auth'

// ===== AUTHENTICATION FUNCTIONS =====

export const signInUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    console.error('Error signing in:', error)
    throw error
  }
}

export const createUser = async (email: string, password: string, userData: any) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update profile with display name
    if (userData.displayName) {
      await updateProfile(user, { displayName: userData.displayName })
    }

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      ...userData,
      uid: user.uid,
      email: user.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return user
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

export const updateUserProfile = async (displayName?: string, photoURL?: string) => {
  try {
    const user = auth.currentUser
    if (!user) throw new Error('No user logged in')

    await updateProfile(user, { displayName, photoURL })
  } catch (error) {
    console.error('Error updating profile:', error)
    throw error
  }
}

export const updateUserPassword = async (newPassword: string) => {
  try {
    const user = auth.currentUser
    if (!user) throw new Error('No user logged in')

    await updatePassword(user, newPassword)
    return true
  } catch (error) {
    console.error('Error updating password:', error)
    throw error
  }
}

// ===== FIRESTORE FUNCTIONS =====

export const getUserData = async (uid: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid))
    return userDoc.exists() ? userDoc.data() : null
  } catch (error) {
    console.error('Error getting user data:', error)
    return null
  }
}

export const updateUserData = async (uid: string, data: any) => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...data,
      updatedAt: serverTimestamp(),
    })
    return true
  } catch (error) {
    console.error('Error updating user data:', error)
    throw error
  }
}

// ===== COURSES FUNCTIONS =====

export const createCourse = async (courseData: any) => {
  try {
    const courseRef = await addDoc(collection(db, 'courses'), {
      ...courseData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return courseRef.id
  } catch (error) {
    console.error('Error creating course:', error)
    throw error
  }
}

export const updateCourse = async (courseId: string, courseData: any) => {
  try {
    await updateDoc(doc(db, 'courses', courseId), {
      ...courseData,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error updating course:', error)
    throw error
  }
}

export const deleteCourse = async (courseId: string) => {
  try {
    await deleteDoc(doc(db, 'courses', courseId))
  } catch (error) {
    console.error('Error deleting course:', error)
    throw error
  }
}

export const getCourses = async () => {
  try {
    const coursesSnapshot = await getDocs(collection(db, 'courses'))
    return coursesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[]
  } catch (error) {
    console.error('Error getting courses:', error)
    return []
  }
}

export const getCourseById = async (courseId: string) => {
  try {
    const courseDoc = await getDoc(doc(db, 'courses', courseId))
    return courseDoc.exists() ? { id: courseDoc.id, ...courseDoc.data() } : null
  } catch (error) {
    console.error('Error getting course:', error)
    return null
  }
}

// ===== SUBJECTS FUNCTIONS =====

export const createSubject = async (courseId: string, subjectData: any) => {
  try {
    const subjectRef = await addDoc(collection(db, 'courses', courseId, 'subjects'), {
      ...subjectData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return subjectRef.id
  } catch (error) {
    console.error('Error creating subject:', error)
    throw error
  }
}

export const getSubjects = async (courseId: string) => {
  try {
    const subjectsSnapshot = await getDocs(collection(db, 'courses', courseId, 'subjects'))
    return subjectsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[]
  } catch (error) {
    console.error('Error getting subjects:', error)
    return []
  }
}

// ===== TOPICS FUNCTIONS =====

export const createTopic = async (courseId: string, subjectId: string, topicData: any) => {
  try {
    const topicRef = await addDoc(collection(db, 'courses', courseId, 'subjects', subjectId, 'topics'), {
      ...topicData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return topicRef.id
  } catch (error) {
    console.error('Error creating topic:', error)
    throw error
  }
}

export const getTopics = async (courseId: string, subjectId: string) => {
  try {
    const topicsSnapshot = await getDocs(collection(db, 'courses', courseId, 'subjects', subjectId, 'topics'))
    return topicsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[]
  } catch (error) {
    console.error('Error getting topics:', error)
    return []
  }
}

// ===== SUBTOPICS FUNCTIONS =====

export const createSubTopic = async (courseId: string, subjectId: string, topicId: string, subTopicData: any) => {
  try {
    const subTopicRef = await addDoc(collection(db, 'courses', courseId, 'subjects', subjectId, 'topics', topicId, 'subtopics'), {
      ...subTopicData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return subTopicRef.id
  } catch (error) {
    console.error('Error creating subtopic:', error)
    throw error
  }
}

export const getSubTopics = async (courseId: string, subjectId: string, topicId: string) => {
  try {
    const subTopicsSnapshot = await getDocs(collection(db, 'courses', courseId, 'subjects', subjectId, 'topics', topicId, 'subtopics'))
    return subTopicsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[]
  } catch (error) {
    console.error('Error getting subtopics:', error)
    return []
  }
}

// ===== FLASHCARDS FUNCTIONS =====

export const createFlashcard = async (courseId: string, subjectId: string, topicId: string, subTopicId: string, flashcardData: any) => {
  try {
    const flashcardRef = await addDoc(collection(db, 'courses', courseId, 'subjects', subjectId, 'topics', topicId, 'subtopics', subTopicId, 'flashcards'), {
      ...flashcardData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return flashcardRef.id
  } catch (error) {
    console.error('Error creating flashcard:', error)
    throw error
  }
}

export const updateFlashcard = async (courseId: string, subjectId: string, topicId: string, subTopicId: string, flashcardId: string, flashcardData: any) => {
  try {
    await updateDoc(doc(db, 'courses', courseId, 'subjects', subjectId, 'topics', topicId, 'subtopics', subTopicId, 'flashcards', flashcardId), {
      ...flashcardData,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error updating flashcard:', error)
    throw error
  }
}

export const deleteFlashcard = async (courseId: string, subjectId: string, topicId: string, subTopicId: string, flashcardId: string) => {
  try {
    await deleteDoc(doc(db, 'courses', courseId, 'subjects', subjectId, 'topics', topicId, 'subtopics', subTopicId, 'flashcards', flashcardId))
  } catch (error) {
    console.error('Error deleting flashcard:', error)
    throw error
  }
}

export const getFlashcards = async (courseId: string, subjectId: string, topicId: string, subTopicId: string) => {
  try {
    const flashcardsSnapshot = await getDocs(collection(db, 'courses', courseId, 'subjects', subjectId, 'topics', topicId, 'subtopics', subTopicId, 'flashcards'))
    return flashcardsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[]
  } catch (error) {
    console.error('Error getting flashcards:', error)
    return []
  }
}

// ===== DEEPENINGS FUNCTIONS =====

export const createDeepening = async (courseId: string, subjectId: string, topicId: string, subTopicId: string, deepeningData: any) => {
  try {
    const deepeningRef = await addDoc(collection(db, 'courses', courseId, 'subjects', subjectId, 'topics', topicId, 'subtopics', subTopicId, 'deepenings'), {
      ...deepeningData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return deepeningRef.id
  } catch (error) {
    console.error('Error creating deepening:', error)
    throw error
  }
}

export const getDeepenings = async (courseId: string, subjectId: string, topicId: string, subTopicId: string) => {
  try {
    const deepeningsSnapshot = await getDocs(collection(db, 'courses', courseId, 'subjects', subjectId, 'topics', topicId, 'subtopics', subTopicId, 'deepenings'))
    return deepeningsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[]
  } catch (error) {
    console.error('Error getting deepenings:', error)
    return []
  }
}

// ===== USER PROGRESS FUNCTIONS =====

export const createUserProgress = async (uid: string, courseId: string, progressData: any) => {
  try {
    await setDoc(doc(db, 'users', uid, 'progress', courseId), {
      ...progressData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error creating user progress:', error)
    throw error
  }
}

export const updateUserProgress = async (uid: string, courseId: string, progressData: any) => {
  try {
    await updateDoc(doc(db, 'users', uid, 'progress', courseId), {
      ...progressData,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error updating user progress:', error)
    throw error
  }
}

export const getUserProgress = async (uid: string, courseId: string) => {
  try {
    const progressDoc = await getDoc(doc(db, 'users', uid, 'progress', courseId))
    return progressDoc.exists() ? progressDoc.data() : null
  } catch (error) {
    console.error('Error getting user progress:', error)
    return null
  }
}

// ===== STUDY SESSIONS FUNCTIONS =====

export const createStudySession = async (uid: string, sessionData: any) => {
  try {
    const sessionRef = await addDoc(collection(db, 'users', uid, 'studySessions'), {
      ...sessionData,
      createdAt: serverTimestamp(),
    })
    return sessionRef.id
  } catch (error) {
    console.error('Error creating study session:', error)
    throw error
  }
}

export const getStudySessions = async (uid: string) => {
  try {
    const sessionsSnapshot = await getDocs(collection(db, 'users', uid, 'studySessions'))
    return sessionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting study sessions:', error)
    return []
  }
}

// ===== PAYMENT FUNCTIONS =====

export const createPayment = async (uid: string, paymentData: any) => {
  try {
    const paymentRef = await addDoc(collection(db, 'payments'), {
      uid,
      ...paymentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return paymentRef.id
  } catch (error) {
    console.error('Error creating payment:', error)
    throw error
  }
}

export const updatePaymentStatus = async (paymentId: string, status: string) => {
  try {
    await updateDoc(doc(db, 'payments', paymentId), {
      status,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error updating payment status:', error)
    throw error
  }
}

// ===== TESTIMONIALS FUNCTIONS =====

export const createTestimonial = async (uid: string, testimonialData: any) => {
  try {
    const testimonialRef = await addDoc(collection(db, 'testimonials'), {
      uid,
      ...testimonialData,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return testimonialRef.id
  } catch (error) {
    console.error('Error creating testimonial:', error)
    throw error
  }
}

export const updateTestimonialStatus = async (testimonialId: string, status: string) => {
  try {
    await updateDoc(doc(db, 'testimonials', testimonialId), {
      status,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error updating testimonial status:', error)
    throw error
  }
}

export const getTestimonials = async (status: string = 'approved') => {
  try {
    let testimonialsQuery
    if (status === 'all') {
      testimonialsQuery = collection(db, 'testimonials')
    } else {
      testimonialsQuery = query(collection(db, 'testimonials'), where('status', '==', status))
    }
    const testimonialsSnapshot = await getDocs(testimonialsQuery)
    return testimonialsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting testimonials:', error)
    return []
  }
}

// ===== ADMIN USER MANAGEMENT FUNCTIONS =====

export const getAllUsers = async () => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'))
    return usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting all users:', error)
    return []
  }
}

export const createUserByAdmin = async (userData: any) => {
  try {
    const userRef = await addDoc(collection(db, 'users'), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return userRef.id
  } catch (error) {
    console.error('Error creating user by admin:', error)
    throw error
  }
}

export const updateUserByAdmin = async (uid: string, userData: any) => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...userData,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error updating user by admin:', error)
    throw error
  }
}

export const deleteUserByAdmin = async (uid: string) => {
  try {
    await deleteDoc(doc(db, 'users', uid))
  } catch (error) {
    console.error('Error deleting user by admin:', error)
    throw error
  }
}

// ===== STORAGE FUNCTIONS =====

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

export const deleteFile = async (path: string) => {
  try {
    const storageRef = ref(storage, path)
    await deleteObject(storageRef)
  } catch (error) {
    console.error('Error deleting file:', error)
    throw error
  }
}

// ===== REAL-TIME LISTENERS =====

export const onUserDataChange = (uid: string, callback: (data: any) => void) => {
  return onSnapshot(doc(db, 'users', uid), (doc) => {
    callback(doc.exists() ? doc.data() : null)
  })
}

export const onUsersChange = (callback: (data: any[]) => void) => {
  return onSnapshot(collection(db, 'users'), (snapshot) => {
    const users = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }))
    callback(users)
  })
}

export const onTestimonialsChange = (callback: (data: any[]) => void) => {
  return onSnapshot(collection(db, 'testimonials'), (snapshot) => {
    const testimonials = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    callback(testimonials)
  })
}

export const onCoursesChange = (callback: (data: any[]) => void) => {
  return onSnapshot(collection(db, 'courses'), (snapshot) => {
    const courses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    callback(courses)
  })
}

export const onFlashcardsChange = (courseId: string, subjectId: string, topicId: string, subTopicId: string, callback: (data: any[]) => void) => {
  return onSnapshot(collection(db, 'courses', courseId, 'subjects', subjectId, 'topics', topicId, 'subtopics', subTopicId, 'flashcards'), (snapshot) => {
    const flashcards = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    callback(flashcards)
  })
} 