export interface ProgressData {
  [subjectId: string]: {
    [topicId: string]: {
      completedCards: string[]
      totalCards: number
      lastStudied: Date
    }
  }
}

// Função para verificar se estamos no cliente
function isClient() {
  return typeof window !== 'undefined'
}

// Função para salvar progresso de um card específico
export function saveCardProgress(subjectId: string, topicId: string, cardId: string, totalCards: number) {
  if (!isClient()) return

  try {
    const progressKey = `flashconcards_progress_${subjectId}`
    const existingProgress = localStorage.getItem(progressKey)
    const progress: ProgressData = existingProgress ? JSON.parse(existingProgress) : {}

    if (!progress[subjectId]) {
      progress[subjectId] = {}
    }

    if (!progress[subjectId][topicId]) {
      progress[subjectId][topicId] = {
        completedCards: [],
        totalCards: totalCards,
        lastStudied: new Date()
      }
    }

    // Adicionar card completado se não existir
    if (!progress[subjectId][topicId].completedCards.includes(cardId)) {
      progress[subjectId][topicId].completedCards.push(cardId)
    }

    progress[subjectId][topicId].lastStudied = new Date()

    localStorage.setItem(progressKey, JSON.stringify(progress))
  } catch (error) {
    console.error('Erro ao salvar progresso:', error)
  }
}

// Função para obter progresso de uma matéria
export function getSubjectProgress(subjectId: string): ProgressData[string] | null {
  if (!isClient()) return null

  try {
    const progressKey = `flashconcards_progress_${subjectId}`
    const existingProgress = localStorage.getItem(progressKey)
    
    if (!existingProgress) return null

    const progress: ProgressData = JSON.parse(existingProgress)
    return progress[subjectId] || null
  } catch (error) {
    console.error('Erro ao obter progresso da matéria:', error)
    return null
  }
}

// Função para obter progresso de um tópico específico
export function getTopicProgress(subjectId: string, topicId: string) {
  if (!isClient()) {
    return {
      completedCards: [],
      totalCards: 0,
      lastStudied: null
    }
  }

  try {
    const subjectProgress = getSubjectProgress(subjectId)
    if (!subjectProgress || !subjectProgress[topicId]) {
      return {
        completedCards: [],
        totalCards: 0,
        lastStudied: null
      }
    }

    return subjectProgress[topicId]
  } catch (error) {
    console.error('Erro ao obter progresso do tópico:', error)
    return {
      completedCards: [],
      totalCards: 0,
      lastStudied: null
    }
  }
}

// Função para obter estatísticas gerais de progresso
export function getOverallProgress() {
  if (!isClient()) return { totalCompleted: 0, totalCards: 0, percentage: 0 }

  try {
    const subjects = ['portugues', 'informatica', 'constitucional', 'administrativo', 'realidade-goias', 'legislacao-alego']
    let totalCompleted = 0
    let totalCards = 0

    subjects.forEach(subjectId => {
      const subjectProgress = getSubjectProgress(subjectId)
      if (subjectProgress) {
        Object.values(subjectProgress).forEach(topic => {
          totalCompleted += topic.completedCards.length
          totalCards += topic.totalCards
        })
      }
    })

    return {
      totalCompleted,
      totalCards,
      percentage: totalCards > 0 ? Math.round((totalCompleted / totalCards) * 100) : 0
    }
  } catch (error) {
    console.error('Erro ao obter progresso geral:', error)
    return { totalCompleted: 0, totalCards: 0, percentage: 0 }
  }
}

// Função para limpar progresso (para reset)
export function clearProgress(subjectId?: string) {
  if (!isClient()) return

  try {
    if (subjectId) {
      const progressKey = `flashconcards_progress_${subjectId}`
      localStorage.removeItem(progressKey)
    } else {
      // Limpar todo o progresso
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('flashconcards_progress_')) {
          localStorage.removeItem(key)
        }
      })
    }
  } catch (error) {
    console.error('Erro ao limpar progresso:', error)
  }
} 