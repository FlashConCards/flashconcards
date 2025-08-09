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
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { UserStats, Achievement, Challenge, LeaderboardEntry } from '@/types';

// ===== SISTEMA DE XP E NÍVEIS =====

export const calculateLevel = (xp: number): number => {
  // Fórmula: Nível = sqrt(XP / 100)
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

export const getXPForNextLevel = (currentLevel: number): number => {
  // XP necessário para o próximo nível
  return Math.pow(currentLevel, 2) * 100;
};

export const awardXP = async (userId: string, xpAmount: number, reason: string) => {
  try {
    const userStatsRef = doc(db, 'user-stats', userId);
    const userStatsDoc = await getDoc(userStatsRef);
    
    let currentStats: UserStats;
    
    if (userStatsDoc.exists()) {
      currentStats = userStatsDoc.data() as UserStats;
    } else {
      // Criar stats inicial
      currentStats = {
        totalCards: 0,
        studiedCards: 0,
        correctCards: 0,
        wrongCards: 0,
        studyStreak: 0,
        totalXP: 0,
        level: 1,
        achievements: [],
        dailyGoal: 10,
        weeklyGoal: 50,
        monthlyGoal: 200
      };
    }
    
    const oldLevel = currentStats.level;
    const newXP = currentStats.totalXP + xpAmount;
    const newLevel = calculateLevel(newXP);
    
    // Atualizar stats
    const updatedStats: UserStats = {
      ...currentStats,
      totalXP: newXP,
      level: newLevel
    };
    
    await setDoc(userStatsRef, updatedStats);
    
    // Verificar se subiu de nível
    if (newLevel > oldLevel) {
      await handleLevelUp(userId, newLevel);
    }
    
    // Verificar conquistas
    await checkAchievements(userId, updatedStats);
    
    console.log(`Awarded ${xpAmount} XP to user ${userId} for: ${reason}`);
    
    return {
      xpAwarded: xpAmount,
      newXP,
      levelUp: newLevel > oldLevel,
      newLevel
    };
  } catch (error) {
    console.error('Error awarding XP:', error);
    throw error;
  }
};

const handleLevelUp = async (userId: string, newLevel: number) => {
  // Registrar level up
  await setDoc(doc(db, 'level-ups', `${userId}_${Date.now()}`), {
    userId,
    newLevel,
    timestamp: serverTimestamp()
  });
  
  console.log(`User ${userId} leveled up to level ${newLevel}!`);
};

// ===== SISTEMA DE CONQUISTAS =====

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_study',
    title: 'Primeira Sessão',
    description: 'Complete sua primeira sessão de estudos',
    icon: '🎯',
    xpReward: 50,
    type: 'cards_studied',
    requirement: 1,
    isUnlocked: false
  },
  {
    id: 'study_10_cards',
    title: 'Estudante Iniciante',
    description: 'Estude 10 flashcards',
    icon: '📚',
    xpReward: 100,
    type: 'cards_studied',
    requirement: 10,
    isUnlocked: false
  },
  {
    id: 'study_100_cards',
    title: 'Estudante Dedicado',
    description: 'Estude 100 flashcards',
    icon: '🏆',
    xpReward: 500,
    type: 'cards_studied',
    requirement: 100,
    isUnlocked: false
  },
  {
    id: 'correct_50',
    title: 'Precisão',
    description: 'Acerte 50 flashcards',
    icon: '✅',
    xpReward: 200,
    type: 'correct_answers',
    requirement: 50,
    isUnlocked: false
  },
  {
    id: 'streak_7',
    title: 'Semana Completa',
    description: 'Estude por 7 dias seguidos',
    icon: '🔥',
    xpReward: 300,
    type: 'study_streak',
    requirement: 7,
    isUnlocked: false
  },
  {
    id: 'streak_30',
    title: 'Mestre da Consistência',
    description: 'Estude por 30 dias seguidos',
    icon: '💎',
    xpReward: 1000,
    type: 'study_streak',
    requirement: 30,
    isUnlocked: false
  }
];

export const checkAchievements = async (userId: string, userStats: UserStats) => {
  try {
    const newAchievements: Achievement[] = [];
    
    for (const achievement of ACHIEVEMENTS) {
      // Verificar se já foi desbloqueada
      const alreadyUnlocked = userStats.achievements.some(a => a.id === achievement.id);
      if (alreadyUnlocked) continue;
      
      let shouldUnlock = false;
      
      switch (achievement.type) {
        case 'cards_studied':
          shouldUnlock = userStats.studiedCards >= achievement.requirement;
          break;
        case 'correct_answers':
          shouldUnlock = userStats.correctCards >= achievement.requirement;
          break;
        case 'study_streak':
          shouldUnlock = userStats.studyStreak >= achievement.requirement;
          break;
      }
      
      if (shouldUnlock) {
        const unlockedAchievement: Achievement = {
          ...achievement,
          isUnlocked: true,
          unlockedAt: new Date()
        };
        
        newAchievements.push(unlockedAchievement);
        
        // Dar XP pela conquista
        await awardXP(userId, achievement.xpReward, `Achievement: ${achievement.title}`);
      }
    }
    
    if (newAchievements.length > 0) {
      // Atualizar conquistas do usuário
      const userStatsRef = doc(db, 'user-stats', userId);
      await updateDoc(userStatsRef, {
        achievements: [...userStats.achievements, ...newAchievements]
      });
      
      console.log(`User ${userId} unlocked ${newAchievements.length} achievements`);
    }
    
    return newAchievements;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
};

// ===== SISTEMA DE DESAFIOS =====

export const createDailyChallenge = async (userId: string): Promise<Challenge> => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const challenge: Challenge = {
    id: `daily_${userId}_${today.toISOString().split('T')[0]}`,
    title: 'Desafio Diário',
    description: 'Estude 15 cards hoje',
    type: 'daily',
    target: 15,
    current: 0,
    xpReward: 100,
    deadline: tomorrow,
    isCompleted: false
  };
  
  await setDoc(doc(db, 'challenges', challenge.id), challenge);
  return challenge;
};

export const updateChallengeProgress = async (userId: string, cardsStudied: number) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const challengeId = `daily_${userId}_${today}`;
    
    const challengeRef = doc(db, 'challenges', challengeId);
    const challengeDoc = await getDoc(challengeRef);
    
    if (challengeDoc.exists()) {
      const challenge = challengeDoc.data() as Challenge;
      const newCurrent = Math.min(challenge.current + cardsStudied, challenge.target);
      
      await updateDoc(challengeRef, {
        current: newCurrent,
        isCompleted: newCurrent >= challenge.target
      });
      
      // Se completou o desafio
      if (newCurrent >= challenge.target && !challenge.isCompleted) {
        await awardXP(userId, challenge.xpReward, 'Challenge completed');
      }
    } else {
      // Criar desafio se não existir
      await createDailyChallenge(userId);
    }
  } catch (error) {
    console.error('Error updating challenge progress:', error);
  }
};

// ===== RANKING E LEADERBOARD =====

export const getLeaderboard = async (limit: number = 10): Promise<LeaderboardEntry[]> => {
  try {
    const q = query(
      collection(db, 'user-stats'),
      orderBy('totalXP', 'desc'),
      limit(limit)
    );
    
    const querySnapshot = await getDocs(q);
    const leaderboard: LeaderboardEntry[] = [];
    
    querySnapshot.forEach((doc, index) => {
      const data = doc.data() as UserStats;
      leaderboard.push({
        userId: doc.id,
        userName: 'Usuario', // Buscar nome real do usuário
        totalXP: data.totalXP,
        level: data.level,
        position: index + 1,
        studyStreak: data.studyStreak
      });
    });
    
    return leaderboard;
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
};

// ===== FUNÇÕES DE ESTUDO =====

export const recordStudySession = async (
  userId: string, 
  cardsStudied: number, 
  correctCards: number,
  wrongCards: number
) => {
  try {
    const userStatsRef = doc(db, 'user-stats', userId);
    const userStatsDoc = await getDoc(userStatsRef);
    
    let currentStats: UserStats;
    
    if (userStatsDoc.exists()) {
      currentStats = userStatsDoc.data() as UserStats;
    } else {
      currentStats = {
        totalCards: 0,
        studiedCards: 0,
        correctCards: 0,
        wrongCards: 0,
        studyStreak: 0,
        totalXP: 0,
        level: 1,
        achievements: [],
        dailyGoal: 10,
        weeklyGoal: 50,
        monthlyGoal: 200
      };
    }
    
    // Atualizar estatísticas
    const updatedStats: UserStats = {
      ...currentStats,
      studiedCards: currentStats.studiedCards + cardsStudied,
      correctCards: currentStats.correctCards + correctCards,
      wrongCards: currentStats.wrongCards + wrongCards
    };
    
    await setDoc(userStatsRef, updatedStats);
    
    // Calcular XP baseado no desempenho
    let xpEarned = 0;
    xpEarned += cardsStudied * 5; // 5 XP por card estudado
    xpEarned += correctCards * 10; // 10 XP extra por acerto
    
    // Bonus por alta precisão
    const accuracy = correctCards / cardsStudied;
    if (accuracy >= 0.9) xpEarned += Math.floor(cardsStudied * 5); // 50% bonus
    else if (accuracy >= 0.8) xpEarned += Math.floor(cardsStudied * 2.5); // 25% bonus
    
    await awardXP(userId, xpEarned, 'Study session completed');
    
    // Atualizar progresso dos desafios
    await updateChallengeProgress(userId, cardsStudied);
    
    return {
      xpEarned,
      updatedStats
    };
  } catch (error) {
    console.error('Error recording study session:', error);
    throw error;
  }
};

export const getUserStats = async (userId: string): Promise<UserStats | null> => {
  try {
    const userStatsDoc = await getDoc(doc(db, 'user-stats', userId));
    
    if (userStatsDoc.exists()) {
      return userStatsDoc.data() as UserStats;
    } else {
      // Criar stats inicial
      const initialStats: UserStats = {
        totalCards: 0,
        studiedCards: 0,
        correctCards: 0,
        wrongCards: 0,
        studyStreak: 0,
        totalXP: 0,
        level: 1,
        achievements: [],
        dailyGoal: 10,
        weeklyGoal: 50,
        monthlyGoal: 200
      };
      
      await setDoc(doc(db, 'user-stats', userId), initialStats);
      return initialStats;
    }
  } catch (error) {
    console.error('Error getting user stats:', error);
    return null;
  }
};
