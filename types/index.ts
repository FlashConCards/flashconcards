export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  isAdmin: boolean;
  isModerator?: boolean;
  isTeacher?: boolean;
  isPaid: boolean;
  isActive: boolean;
  studyTime: number;
  cardsStudied: number;
  cardsCorrect: number;
  cardsWrong: number;
  createdByAdmin?: boolean;
  selectedCourse?: string;
  courseAccessExpiry?: any; // Data de expiração do acesso ao curso
  lastLoginAt?: any;
  createdAt?: any;
  updatedAt?: any;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  expirationMonths: number; // Padrão: 6 meses
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface Subject {
  id: string;
  courseId: string;
  name: string;
  description: string;
  order: number;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  description: string;
  order: number;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface SubTopic {
  id: string;
  topicId: string;
  name: string;
  description: string;
  order: number;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface Flashcard {
  id: string;
  subTopicId: string;
  front: string;
  back: string;
  explanation?: string;
  order: number;
  isActive: boolean;
  deepening?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Deepening {
  id: string;
  subTopicId: string;
  title: string;
  content: string;
  images: string[];
  videos: string[];
  pdfs: string[];
  externalLinks: string[];
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface UserProgress {
  id: string
  userId: string
  flashcardId: string
  status: 'not_studied' | 'learned' | 'review_later' | 'wrong'
  studyCount: number
  lastStudiedAt?: Date
  nextReviewAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface StudySession {
  id: string
  userId: string
  courseId: string
  startTime: Date
  endTime?: Date
  cardsStudied: number
  cardsCorrect: number
  cardsWrong: number
}

export interface Payment {
  id: string
  userId: string
  courseId: string
  amount: number
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  mercadopagoId: string
  pixQrCode?: string
  pixQrCodeBase64?: string
  createdAt: Date
  updatedAt: Date
}

export interface AdminStats {
  totalUsers: number
  paidUsers: number
  totalCourses: number
  totalFlashcards: number
  totalStudySessions: number
  revenue: number
}

export interface Testimonial {
  id: string
  uid: string
  name: string
  email: string
  role: string
  content: string
  rating: number
  course: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: any
  updatedAt: any
}

export interface Post {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorEmail?: string;
  authorPhotoURL?: string;
  authorRole: 'admin' | 'moderator' | 'teacher' | 'user';
  isOfficial?: boolean;
  createdAt: any;
  updatedAt?: any;
  likes: string[];
  comments: Comment[];
  imageUrl?: string;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  authorRole: 'admin' | 'moderator' | 'teacher' | 'user';
  createdAt: any;
  imageUrl?: string;
}

// ===== SISTEMA DE GAMIFICAÇÃO =====

export interface UserStats {
  totalCards: number;
  studiedCards: number;
  correctCards: number;
  wrongCards: number;
  studyStreak: number;
  totalXP: number;
  level: number;
  achievements: Achievement[];
  dailyGoal: number;
  weeklyGoal: number;
  monthlyGoal: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  type: 'cards_studied' | 'correct_answers' | 'study_streak' | 'subjects_completed' | 'special';
  requirement: number;
  unlockedAt?: Date;
  isUnlocked: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  target: number;
  current: number;
  xpReward: number;
  deadline: Date;
  isCompleted: boolean;
  subjectId?: string;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  userPhoto?: string;
  totalXP: number;
  level: number;
  position: number;
  studyStreak: number;
}

// ===== SISTEMA DE IA ADAPTATIVA =====

export interface AIProfile {
  userId: string;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  strongSubjects: string[];
  weakSubjects: string[];
  optimalStudyTime: number; // em minutos
  difficultyPreference: 'easy' | 'medium' | 'hard' | 'adaptive';
  lastAnalysis: Date;
  recommendations: AIRecommendation[];
}

export interface AIRecommendation {
  id: string;
  type: 'study_plan' | 'review_cards' | 'new_subject' | 'break_suggestion' | 'difficulty_adjustment';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  subjectId?: string;
  flashcardIds?: string[];
  estimatedTime: number;
  confidence: number; // 0-1
  createdAt: Date;
  appliedAt?: Date;
}

export interface StudyPattern {
  userId: string;
  subjectId: string;
  averageAccuracy: number;
  averageResponseTime: number;
  preferredStudyTime: number;
  commonMistakes: string[];
  improvementAreas: string[];
  lastUpdated: Date;
}

export interface SmartFlashcard extends Flashcard {
  aiGenerated?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
  examBoard?: string;
  questionType?: string;
  adaptiveLevel?: number;
  userAccuracy?: number;
  nextReviewDate?: Date;
  reviewCount?: number;
  lastReviewed?: Date;
} 