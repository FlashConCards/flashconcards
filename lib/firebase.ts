// Temporary Firebase configuration for deployment
// This will be replaced with real Firebase implementation later

// Mock Firebase objects for now
export const auth = {
  currentUser: null,
  onAuthStateChanged: (callback: any) => {
    // Mock auth state
    callback(null);
    return () => {};
  }
};

export const db = {
  collection: () => ({
    doc: () => ({
      get: () => Promise.resolve({ data: () => null }),
      set: () => Promise.resolve(),
      update: () => Promise.resolve(),
      delete: () => Promise.resolve()
    }),
    add: () => Promise.resolve({ id: 'mock-id' }),
    get: () => Promise.resolve({ docs: [] })
  })
};

export const storage = {
  ref: () => ({
    put: () => Promise.resolve({ ref: { getDownloadURL: () => Promise.resolve('mock-url') } }),
    delete: () => Promise.resolve()
  })
};

// ===== AUTHENTICATION FUNCTIONS =====

export const signInUser = async (email: string, password: string) => {
  // Mock implementation for deployment
  return { uid: 'mock-user-id', email };
};

export const createUser = async (email: string, password: string, userData: any) => {
  // Mock implementation for deployment
  return { uid: 'mock-user-id', email };
};

export const signOutUser = async () => {
  // Mock implementation for deployment
  return Promise.resolve();
};

export const updateUserProfile = async (displayName?: string, photoURL?: string) => {
  // Mock implementation for deployment
  return Promise.resolve();
};

export const updateUserPassword = async (newPassword: string) => {
  // Mock implementation for deployment
  return Promise.resolve(true);
};

// ===== FIRESTORE FUNCTIONS =====

export const getUserData = async (uid: string) => {
  // Mock implementation for deployment
  return Promise.resolve(null);
};

export const updateUserData = async (uid: string, data: any) => {
  // Mock implementation for deployment
  return Promise.resolve(true);
};

// ===== COURSES FUNCTIONS =====

export const createCourse = async (courseData: any) => {
  // Mock implementation for deployment
  return Promise.resolve('mock-course-id');
};

export const updateCourse = async (courseId: string, courseData: any) => {
  // Mock implementation for deployment
  return Promise.resolve();
};

export const deleteCourse = async (courseId: string) => {
  // Mock implementation for deployment
  return Promise.resolve();
};

export const getCourses = async () => {
  // Mock implementation for deployment
  return Promise.resolve([]);
};

export const getCourseById = async (courseId: string) => {
  // Mock implementation for deployment
  return Promise.resolve(null);
};

// ===== SUBJECTS FUNCTIONS =====

export const createSubject = async (courseId: string, subjectData: any) => {
  // Mock implementation for deployment
  return Promise.resolve('mock-subject-id');
};

export const getSubjects = async (courseId: string) => {
  // Mock implementation for deployment
  return Promise.resolve([]);
};

// ===== TOPICS FUNCTIONS =====

export const createTopic = async (courseId: string, subjectId: string, topicData: any) => {
  // Mock implementation for deployment
  return Promise.resolve('mock-topic-id');
};

export const getTopics = async (courseId: string, subjectId: string) => {
  // Mock implementation for deployment
  return Promise.resolve([]);
};

// ===== SUB-TOPICS FUNCTIONS =====

export const createSubTopic = async (courseId: string, subjectId: string, topicId: string, subTopicData: any) => {
  // Mock implementation for deployment
  return Promise.resolve('mock-subtopic-id');
};

export const getSubTopics = async (courseId: string, subjectId: string, topicId: string) => {
  // Mock implementation for deployment
  return Promise.resolve([]);
};

// ===== FLASHCARDS FUNCTIONS =====

export const createFlashcard = async (courseId: string, subjectId: string, topicId: string, subTopicId: string, flashcardData: any) => {
  // Mock implementation for deployment
  return Promise.resolve('mock-flashcard-id');
};

export const updateFlashcard = async (courseId: string, subjectId: string, topicId: string, subTopicId: string, flashcardId: string, flashcardData: any) => {
  // Mock implementation for deployment
  return Promise.resolve();
};

export const deleteFlashcard = async (courseId: string, subjectId: string, topicId: string, subTopicId: string, flashcardId: string) => {
  // Mock implementation for deployment
  return Promise.resolve();
};

export const getFlashcards = async (courseId: string, subjectId: string, topicId: string, subTopicId: string) => {
  // Mock implementation for deployment
  return Promise.resolve([]);
};

// ===== DEEPENINGS FUNCTIONS =====

export const createDeepening = async (courseId: string, subjectId: string, topicId: string, subTopicId: string, deepeningData: any) => {
  // Mock implementation for deployment
  return Promise.resolve('mock-deepening-id');
};

export const getDeepenings = async (courseId: string, subjectId: string, topicId: string, subTopicId: string) => {
  // Mock implementation for deployment
  return Promise.resolve([]);
};

// ===== USER PROGRESS FUNCTIONS =====

export const createUserProgress = async (uid: string, courseId: string, progressData: any) => {
  // Mock implementation for deployment
  return Promise.resolve('mock-progress-id');
};

export const updateUserProgress = async (uid: string, courseId: string, progressData: any) => {
  // Mock implementation for deployment
  return Promise.resolve();
};

export const getUserProgress = async (uid: string, courseId: string) => {
  // Mock implementation for deployment
  return Promise.resolve(null);
};

// ===== STUDY SESSIONS FUNCTIONS =====

export const createStudySession = async (uid: string, sessionData: any) => {
  // Mock implementation for deployment
  return Promise.resolve('mock-session-id');
};

export const getStudySessions = async (uid: string) => {
  // Mock implementation for deployment
  return Promise.resolve([]);
};

// ===== PAYMENT FUNCTIONS =====

export const createPayment = async (uid: string, paymentData: any) => {
  // Mock implementation for deployment
  return Promise.resolve('mock-payment-id');
};

export const updatePaymentStatus = async (paymentId: string, status: string) => {
  // Mock implementation for deployment
  return Promise.resolve();
};

// ===== TESTIMONIALS FUNCTIONS =====

export const createTestimonial = async (uid: string, testimonialData: any) => {
  // Mock implementation for deployment
  return Promise.resolve('mock-testimonial-id');
};

export const updateTestimonialStatus = async (testimonialId: string, status: string) => {
  // Mock implementation for deployment
  return Promise.resolve();
};

export const getTestimonials = async (status: string = 'approved') => {
  // Mock implementation for deployment
  return Promise.resolve([]);
};

// ===== ADMIN FUNCTIONS =====

export const getAllUsers = async () => {
  // Mock implementation for deployment
  return Promise.resolve([]);
};

export const createUserByAdmin = async (userData: any) => {
  // Mock implementation for deployment
  return Promise.resolve('mock-admin-user-id');
};

export const updateUserByAdmin = async (uid: string, userData: any) => {
  // Mock implementation for deployment
  return Promise.resolve();
};

export const deleteUserByAdmin = async (uid: string) => {
  // Mock implementation for deployment
  return Promise.resolve();
};

// ===== STORAGE FUNCTIONS =====

export const uploadFile = async (file: File, path: string) => {
  // Mock implementation for deployment
  return Promise.resolve('mock-file-url');
};

export const deleteFile = async (path: string) => {
  // Mock implementation for deployment
  return Promise.resolve();
};

// ===== REAL-TIME LISTENERS =====

export const onUserDataChange = (uid: string, callback: (data: any) => void) => {
  // Mock implementation for deployment
  return () => {};
};

export const onCoursesChange = (callback: (data: any[]) => void) => {
  // Mock implementation for deployment
  return () => {};
};

export const onFlashcardsChange = (courseId: string, subjectId: string, topicId: string, subTopicId: string, callback: (data: any[]) => void) => {
  // Mock implementation for deployment
  return () => {};
}; 