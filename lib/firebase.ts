import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile,
  updatePassword,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ===== AUTHENTICATION FUNCTIONS =====

export const signInUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const createUser = async (email: string, password: string, userData: any) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      ...userData,
      uid: user.uid,
      email: user.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updateUserProfile = async (displayName?: string, photoURL?: string) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    await updateProfile(user, {
      displayName: displayName || user.displayName,
      photoURL: photoURL || user.photoURL
    });
    
    // Update Firestore document
    await updateDoc(doc(db, 'users', user.uid), {
      displayName: displayName || user.displayName,
      photoURL: photoURL || user.photoURL,
      updatedAt: serverTimestamp()
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updateUserPassword = async (newPassword: string) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    await updatePassword(user, newPassword);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// ===== FIRESTORE FUNCTIONS =====

export const getUserData = async (uid: string) => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updateUserData = async (uid: string, data: any) => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// ===== COURSES FUNCTIONS =====

export const createCourse = async (courseData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'courses'), {
      ...courseData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true
    });
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updateCourse = async (courseId: string, courseData: any) => {
  try {
    await updateDoc(doc(db, 'courses', courseId), {
      ...courseData,
      updatedAt: serverTimestamp()
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const deleteCourse = async (courseId: string) => {
  try {
    await deleteDoc(doc(db, 'courses', courseId));
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getCourses = async () => {
  try {
    const q = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getCourseById = async (courseId: string) => {
  try {
    const docRef = doc(db, 'courses', courseId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// ===== SUBJECTS FUNCTIONS =====

export const createSubject = async (courseId: string, subjectData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'courses', courseId, 'subjects'), {
      ...subjectData,
      courseId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true
    });
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getSubjects = async (courseId: string) => {
  try {
    const q = query(
      collection(db, 'courses', courseId, 'subjects'), 
      orderBy('order', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// ===== TOPICS FUNCTIONS =====

export const createTopic = async (courseId: string, subjectId: string, topicData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'courses', courseId, 'subjects', subjectId, 'topics'), {
      ...topicData,
      courseId,
      subjectId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true
    });
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getTopics = async (courseId: string, subjectId: string) => {
  try {
    const q = query(
      collection(db, 'courses', courseId, 'subjects', subjectId, 'topics'), 
      orderBy('order', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// ===== SUBTOPICS FUNCTIONS =====

export const createSubTopic = async (courseId: string, subjectId: string, topicId: string, subTopicData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'courses', courseId, 'subjects', subjectId, 'topics', topicId, 'subtopics'), {
      ...subTopicData,
      courseId,
      subjectId,
      topicId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true
    });
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getSubTopics = async (courseId: string, subjectId: string, topicId: string) => {
  try {
    const q = query(
      collection(db, 'courses', courseId, 'subjects', subjectId, 'topics', topicId, 'subtopics'), 
      orderBy('order', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// ===== FLASHCARDS FUNCTIONS =====

export const createFlashcard = async (courseId: string, subjectId: string, topicId: string, subTopicId: string, flashcardData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'courses', courseId, 'subjects', subjectId, 'topics', topicId, 'subtopics', subTopicId, 'flashcards'), {
      ...flashcardData,
      courseId,
      subjectId,
      topicId,
      subTopicId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true
    });
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updateFlashcard = async (courseId: string, subjectId: string, topicId: string, subTopicId: string, flashcardId: string, flashcardData: any) => {
  try {
    await updateDoc(doc(db, 'courses', courseId, 'subjects', subjectId, 'topics', topicId, 'subtopics', subTopicId, 'flashcards', flashcardId), {
      ...flashcardData,
      updatedAt: serverTimestamp()
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const deleteFlashcard = async (courseId: string, subjectId: string, topicId: string, subTopicId: string, flashcardId: string) => {
  try {
    await deleteDoc(doc(db, 'courses', courseId, 'subjects', subjectId, 'topics', topicId, 'subtopics', subTopicId, 'flashcards', flashcardId));
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getFlashcards = async (courseId: string, subjectId: string, topicId: string, subTopicId: string) => {
  try {
    const q = query(
      collection(db, 'courses', courseId, 'subjects', subjectId, 'topics', topicId, 'subtopics', subTopicId, 'flashcards'), 
      where('isActive', '==', true),
      orderBy('order', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// ===== DEEPENING FUNCTIONS =====

export const createDeepening = async (courseId: string, subjectId: string, topicId: string, subTopicId: string, deepeningData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'courses', courseId, 'subjects', subjectId, 'topics', topicId, 'subtopics', subTopicId, 'deepenings'), {
      ...deepeningData,
      courseId,
      subjectId,
      topicId,
      subTopicId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true
    });
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getDeepenings = async (courseId: string, subjectId: string, topicId: string, subTopicId: string) => {
  try {
    const q = query(
      collection(db, 'courses', courseId, 'subjects', subjectId, 'topics', topicId, 'subtopics', subTopicId, 'deepenings'), 
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// ===== USER PROGRESS FUNCTIONS =====

export const createUserProgress = async (uid: string, courseId: string, progressData: any) => {
  try {
    await setDoc(doc(db, 'users', uid, 'progress', courseId), {
      ...progressData,
      uid,
      courseId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updateUserProgress = async (uid: string, courseId: string, progressData: any) => {
  try {
    await updateDoc(doc(db, 'users', uid, 'progress', courseId), {
      ...progressData,
      updatedAt: serverTimestamp()
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getUserProgress = async (uid: string, courseId: string) => {
  try {
    const docRef = doc(db, 'users', uid, 'progress', courseId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// ===== STUDY SESSIONS FUNCTIONS =====

export const createStudySession = async (uid: string, sessionData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'users', uid, 'studySessions'), {
      ...sessionData,
      uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getStudySessions = async (uid: string) => {
  try {
    const q = query(
      collection(db, 'users', uid, 'studySessions'), 
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// ===== PAYMENT FUNCTIONS =====

export const createPayment = async (uid: string, paymentData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'payments'), {
      ...paymentData,
      uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updatePaymentStatus = async (paymentId: string, status: string) => {
  try {
    await updateDoc(doc(db, 'payments', paymentId), {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// ===== TESTIMONIALS FUNCTIONS =====

export const createTestimonial = async (uid: string, testimonialData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'testimonials'), {
      ...testimonialData,
      uid,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updateTestimonialStatus = async (testimonialId: string, status: string) => {
  try {
    await updateDoc(doc(db, 'testimonials', testimonialId), {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getTestimonials = async (status: string = 'approved') => {
  try {
    const q = query(
      collection(db, 'testimonials'), 
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// ===== ADMIN FUNCTIONS =====

export const getAllUsers = async () => {
  try {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const createUserByAdmin = async (userData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'users'), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updateUserByAdmin = async (uid: string, userData: any) => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...userData,
      updatedAt: serverTimestamp()
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const deleteUserByAdmin = async (uid: string) => {
  try {
    await deleteDoc(doc(db, 'users', uid));
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// ===== STORAGE FUNCTIONS =====

export const uploadFile = async (file: File, path: string) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const deleteFile = async (path: string) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// ===== REAL-TIME LISTENERS =====

export const onUserDataChange = (uid: string, callback: (data: any) => void) => {
  return onSnapshot(doc(db, 'users', uid), (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    } else {
      callback(null);
    }
  });
};

export const onCoursesChange = (callback: (data: any[]) => void) => {
  const q = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (querySnapshot) => {
    const courses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(courses);
  });
};

export const onFlashcardsChange = (courseId: string, subjectId: string, topicId: string, subTopicId: string, callback: (data: any[]) => void) => {
  const q = query(
    collection(db, 'courses', courseId, 'subjects', subjectId, 'topics', topicId, 'subtopics', subTopicId, 'flashcards'), 
    where('isActive', '==', true),
    orderBy('order', 'asc')
  );
  return onSnapshot(q, (querySnapshot) => {
    const flashcards = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(flashcards);
  });
}; 