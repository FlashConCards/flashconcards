import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { AIProfile, AIRecommendation, StudyPattern, SmartFlashcard } from '@/types';

// ===== ANÁLISE DE PADRÕES DE ESTUDO =====

export const analyzeStudyPattern = async (userId: string, subjectId: string): Promise<StudyPattern> => {
  try {
    // Buscar sessões de estudo do usuário para a matéria
    const q = query(
      collection(db, 'study-sessions'),
      where('userId', '==', userId),
      where('subjectId', '==', subjectId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const sessions = querySnapshot.docs.map(doc => doc.data());
    
    if (sessions.length === 0) {
      return {
        userId,
        subjectId,
        averageAccuracy: 0,
        averageResponseTime: 0,
        preferredStudyTime: 30,
        commonMistakes: [],
        improvementAreas: [],
        lastUpdated: new Date()
      };
    }
    
    // Calcular métricas
    const totalCards = sessions.reduce((sum, session) => sum + (session.cardsStudied || 0), 0);
    const totalCorrect = sessions.reduce((sum, session) => sum + (session.correctCards || 0), 0);
    const totalTime = sessions.reduce((sum, session) => sum + (session.studyTime || 0), 0);
    
    const averageAccuracy = totalCards > 0 ? totalCorrect / totalCards : 0;
    const averageResponseTime = totalCards > 0 ? totalTime / totalCards : 0;
    const preferredStudyTime = sessions.length > 0 ? totalTime / sessions.length : 30;
    
    // Identificar áreas de melhoria baseado na precisão
    const improvementAreas = [];
    if (averageAccuracy < 0.7) {
      improvementAreas.push('Precisão geral baixa - necessário mais revisão');
    }
    if (averageResponseTime > 60) {
      improvementAreas.push('Tempo de resposta alto - praticar mais');
    }
    
    const pattern: StudyPattern = {
      userId,
      subjectId,
      averageAccuracy,
      averageResponseTime,
      preferredStudyTime,
      commonMistakes: [],
      improvementAreas,
      lastUpdated: new Date()
    };
    
    // Salvar padrão no Firebase
    await setDoc(doc(db, 'study-patterns', `${userId}_${subjectId}`), pattern);
    
    return pattern;
  } catch (error) {
    console.error('Error analyzing study pattern:', error);
    throw error;
  }
};

// ===== PERFIL DE IA ADAPTATIVA =====

export const createAIProfile = async (userId: string): Promise<AIProfile> => {
  try {
    const aiProfile: AIProfile = {
      userId,
      learningStyle: 'reading', // Padrão inicial
      strongSubjects: [],
      weakSubjects: [],
      optimalStudyTime: 30,
      difficultyPreference: 'adaptive',
      lastAnalysis: new Date(),
      recommendations: []
    };
    
    await setDoc(doc(db, 'ai-profiles', userId), aiProfile);
    return aiProfile;
  } catch (error) {
    console.error('Error creating AI profile:', error);
    throw error;
  }
};

export const updateAIProfile = async (userId: string): Promise<AIProfile> => {
  try {
    // Buscar perfil existente ou criar novo
    const profileDoc = await getDoc(doc(db, 'ai-profiles', userId));
    let profile: AIProfile;
    
    if (profileDoc.exists()) {
      profile = profileDoc.data() as AIProfile;
    } else {
      profile = await createAIProfile(userId);
    }
    
    // Analisar desempenho por matéria
    const subjectsQuery = query(collection(db, 'subjects'));
    const subjectsSnapshot = await getDocs(subjectsQuery);
    
    const strongSubjects: string[] = [];
    const weakSubjects: string[] = [];
    
    for (const subjectDoc of subjectsSnapshot.docs) {
      const subjectId = subjectDoc.id;
      const pattern = await analyzeStudyPattern(userId, subjectId);
      
      if (pattern.averageAccuracy >= 0.8) {
        strongSubjects.push(subjectId);
      } else if (pattern.averageAccuracy < 0.6) {
        weakSubjects.push(subjectId);
      }
    }
    
    // Atualizar perfil
    const updatedProfile: AIProfile = {
      ...profile,
      strongSubjects,
      weakSubjects,
      lastAnalysis: new Date(),
      recommendations: await generateRecommendations(userId, strongSubjects, weakSubjects)
    };
    
    await setDoc(doc(db, 'ai-profiles', userId), updatedProfile);
    return updatedProfile;
  } catch (error) {
    console.error('Error updating AI profile:', error);
    throw error;
  }
};

// ===== GERAÇÃO DE RECOMENDAÇÕES =====

export const generateRecommendations = async (
  userId: string, 
  strongSubjects: string[], 
  weakSubjects: string[]
): Promise<AIRecommendation[]> => {
  const recommendations: AIRecommendation[] = [];
  
  // Recomendação para matérias fracas
  if (weakSubjects.length > 0) {
    for (const subjectId of weakSubjects.slice(0, 2)) { // Max 2 matérias
      recommendations.push({
        id: `review_weak_${subjectId}_${Date.now()}`,
        type: 'review_cards',
        title: 'Revisar Matéria Fraca',
        description: 'Dedique mais tempo a esta matéria para melhorar seu desempenho',
        priority: 'high',
        subjectId,
        estimatedTime: 45,
        confidence: 0.9,
        createdAt: new Date()
      });
    }
  }
  
  // Recomendação de pausa se muito tempo estudando
  const userStats = await getUserRecentActivity(userId);
  if (userStats.studyTimeToday > 120) { // Mais de 2 horas hoje
    recommendations.push({
      id: `break_${Date.now()}`,
      type: 'break_suggestion',
      title: 'Hora de uma Pausa',
      description: 'Você já estudou bastante hoje. Que tal uma pausa de 15 minutos?',
      priority: 'medium',
      estimatedTime: 15,
      confidence: 0.8,
      createdAt: new Date()
    });
  }
  
  // Recomendação de novo assunto se dominando bem
  if (strongSubjects.length >= 2) {
    recommendations.push({
      id: `new_subject_${Date.now()}`,
      type: 'new_subject',
      title: 'Explorar Nova Matéria',
      description: 'Você está indo bem! Que tal começar uma nova matéria?',
      priority: 'low',
      estimatedTime: 30,
      confidence: 0.7,
      createdAt: new Date()
    });
  }
  
  return recommendations;
};

const getUserRecentActivity = async (userId: string) => {
  // Função helper para buscar atividade recente
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const q = query(
    collection(db, 'study-sessions'),
    where('userId', '==', userId),
    where('createdAt', '>=', today)
  );
  
  const snapshot = await getDocs(q);
  const sessions = snapshot.docs.map(doc => doc.data());
  
  const studyTimeToday = sessions.reduce((total, session) => total + (session.studyTime || 0), 0);
  
  return { studyTimeToday };
};

// ===== SISTEMA DE FLASHCARDS INTELIGENTES =====

export const generateSmartFlashcards = async (
  content: string, 
  subTopicId: string, 
  userProfile: AIProfile,
  settings: {
    quantity: number;
    difficulty: string;
    examBoard: string;
    questionType: string;
  }
): Promise<SmartFlashcard[]> => {
  try {
    // Simular geração com IA (em produção, usar OpenAI/Claude API)
    const flashcards: SmartFlashcard[] = [];
    
    // Ajustar dificuldade baseado no perfil do usuário
    let adjustedDifficulty = settings.difficulty;
    if (userProfile.difficultyPreference === 'adaptive') {
      const subjectPattern = await analyzeStudyPattern(userProfile.userId, subTopicId);
      if (subjectPattern.averageAccuracy >= 0.8) {
        adjustedDifficulty = 'hard';
      } else if (subjectPattern.averageAccuracy < 0.6) {
        adjustedDifficulty = 'easy';
      } else {
        adjustedDifficulty = 'medium';
      }
    }
    
    // Gerar flashcards baseado no conteúdo e preferências
    for (let i = 0; i < settings.quantity; i++) {
      const flashcard: SmartFlashcard = {
        id: `smart_${Date.now()}_${i}`,
        subTopicId,
        front: `Pergunta ${i + 1} sobre o conteúdo (${adjustedDifficulty})`,
        back: `Resposta detalhada baseada no conteúdo fornecido`,
        explanation: `Explicação adaptada ao nível ${adjustedDifficulty}`,
        order: i + 1,
        isActive: true,
        aiGenerated: true,
        difficulty: adjustedDifficulty as 'easy' | 'medium' | 'hard',
        examBoard: settings.examBoard,
        questionType: settings.questionType,
        adaptiveLevel: 1,
        userAccuracy: 0,
        reviewCount: 0,
        nextReviewDate: new Date()
      };
      
      flashcards.push(flashcard);
    }
    
    return flashcards;
  } catch (error) {
    console.error('Error generating smart flashcards:', error);
    throw error;
  }
};

// ===== ALGORITMO DE REPETIÇÃO ESPAÇADA =====

export const calculateNextReviewDate = (
  accuracy: number, 
  reviewCount: number, 
  lastReviewed: Date
): Date => {
  // Algoritmo baseado no SM-2 (SuperMemo)
  let interval: number;
  
  if (reviewCount === 0) {
    interval = 1; // 1 dia
  } else if (reviewCount === 1) {
    interval = accuracy >= 0.8 ? 6 : 1; // 6 dias se acertou, 1 se errou
  } else {
    // Fator de facilidade baseado na precisão
    const easeFactor = Math.max(1.3, 2.5 + (accuracy - 0.8) * 1.5);
    interval = Math.round(interval * easeFactor);
    
    if (accuracy < 0.6) {
      interval = 1; // Resetar se muito ruim
    }
  }
  
  const nextReview = new Date(lastReviewed);
  nextReview.setDate(nextReview.getDate() + interval);
  
  return nextReview;
};

export const updateFlashcardProgress = async (
  flashcardId: string,
  userId: string,
  isCorrect: boolean,
  responseTime: number
) => {
  try {
    const progressRef = doc(db, 'flashcard-progress', `${userId}_${flashcardId}`);
    const progressDoc = await getDoc(progressRef);
    
    let progress;
    if (progressDoc.exists()) {
      progress = progressDoc.data();
    } else {
      progress = {
        userId,
        flashcardId,
        reviewCount: 0,
        correctCount: 0,
        totalReviews: 0,
        averageResponseTime: 0,
        lastReviewed: new Date(),
        nextReview: new Date()
      };
    }
    
    // Atualizar progresso
    progress.totalReviews += 1;
    progress.reviewCount += 1;
    if (isCorrect) progress.correctCount += 1;
    
    const accuracy = progress.correctCount / progress.totalReviews;
    progress.averageResponseTime = (progress.averageResponseTime + responseTime) / 2;
    progress.lastReviewed = new Date();
    progress.nextReview = calculateNextReviewDate(accuracy, progress.reviewCount, new Date());
    
    await setDoc(progressRef, progress);
    
    return progress;
  } catch (error) {
    console.error('Error updating flashcard progress:', error);
    throw error;
  }
};

// ===== RECOMENDAÇÕES PERSONALIZADAS =====

export const getPersonalizedRecommendations = async (userId: string): Promise<AIRecommendation[]> => {
  try {
    const profile = await updateAIProfile(userId);
    return profile.recommendations;
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    return [];
  }
};

export const getAdaptiveFlashcards = async (userId: string, subTopicId: string): Promise<SmartFlashcard[]> => {
  try {
    // Buscar flashcards que precisam de revisão
    const now = new Date();
    const progressQuery = query(
      collection(db, 'flashcard-progress'),
      where('userId', '==', userId),
      where('nextReview', '<=', now)
    );
    
    const progressSnapshot = await getDocs(progressQuery);
    const flashcardsToReview: string[] = [];
    
    progressSnapshot.forEach(doc => {
      const data = doc.data();
      flashcardsToReview.push(data.flashcardId);
    });
    
    // Se não há cards para revisar, retornar cards novos
    if (flashcardsToReview.length === 0) {
      // Buscar cards novos do subtópico
      const flashcardsQuery = query(
        collection(db, 'flashcards'),
        where('subTopicId', '==', subTopicId)
      );
      
      const flashcardsSnapshot = await getDocs(flashcardsQuery);
      return flashcardsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SmartFlashcard[];
    }
    
    // Retornar cards que precisam de revisão
    const reviewCards: SmartFlashcard[] = [];
    for (const flashcardId of flashcardsToReview.slice(0, 10)) { // Max 10
      const cardDoc = await getDoc(doc(db, 'flashcards', flashcardId));
      if (cardDoc.exists()) {
        reviewCards.push({
          id: cardDoc.id,
          ...cardDoc.data()
        } as SmartFlashcard);
      }
    }
    
    return reviewCards;
  } catch (error) {
    console.error('Error getting adaptive flashcards:', error);
    return [];
  }
};
