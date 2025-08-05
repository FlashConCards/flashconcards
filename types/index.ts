export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  isAdmin: boolean;
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
  explanation: string;
  order: number;
  isActive: boolean;
  deepening?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Deepening {
  id: string;
  flashcardId: string;
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
  createdAt: any;
  image?: string;
} 