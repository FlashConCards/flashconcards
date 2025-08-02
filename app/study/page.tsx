'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  getFlashcards,
  updateUserProgress,
  getUserProgress,
  createStudySession
} from '@/lib/firebase';
import { Flashcard } from '@/types';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowLeftIcon,
  InformationCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import FlashcardComponent from '@/components/flashcards/Flashcard';
import DeepeningModal from '@/components/flashcards/DeepeningModal';

export default function StudyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyQueue, setStudyQueue] = useState<Flashcard[]>([]);
  const [completedCards, setCompletedCards] = useState<Flashcard[]>([]);
  const [wrongCards, setWrongCards] = useState<Flashcard[]>([]);
  const [studyTime, setStudyTime] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [showDeepening, setShowDeepening] = useState(false);
  const [selectedDeepening, setSelectedDeepening] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    totalCards: 0,
    correctCards: 0,
    wrongCards: 0,
    studyTime: 0
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'left' | 'right'>('right');

  // Get course info from URL params
  const courseId = searchParams.get('courseId');
  const subjectId = searchParams.get('subjectId');
  const topicId = searchParams.get('topicId');
  const subTopicId = searchParams.get('subTopicId');
  
  console.log('Study page params:', { courseId, subjectId, topicId, subTopicId });

  // Verificar acesso do usuário
  useEffect(() => {
    if (!user) {
      toast.error('Você precisa estar logado para acessar esta página');
      router.push('/login');
      return;
    }

    // Verificar se o usuário tem acesso pago, é admin ou foi criado pelo admin
    if (!user.isPaid && !user.isAdmin && !user.createdByAdmin) {
      toast.error('Você precisa ter acesso pago para estudar. Entre em contato conosco.');
      router.push('/contact');
      return;
    }

    // Verificar se o usuário tem curso selecionado (se não for admin)
    if (!user.isAdmin && !user.selectedCourse) {
      toast.error('Você precisa ter um curso selecionado para estudar.');
      router.push('/courses');
      return;
    }
  }, [user, router]);

  // Timer effect
  useEffect(() => {
    if (!sessionStartTime) return;

    const interval = setInterval(() => {
      setStudyTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (sessionCompleted || loading) return;

      switch (event.key) {
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case '1':
          handleCardResponse(false);
          break;
        case '2':
          handleCardResponse(true);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, studyQueue, sessionCompleted, loading]);

  // Load flashcards
  useEffect(() => {
    if (!courseId || !subjectId || !topicId || !subTopicId) {
      toast.error('Parâmetros de estudo inválidos');
      router.push('/dashboard');
      return;
    }

    const loadFlashcards = async () => {
      try {
        setLoading(true);
        
        // Carregar flashcards reais do Firebase
        const realFlashcards = await getFlashcards(subTopicId);
        console.log('Real flashcards from Firebase:', realFlashcards);
        console.log('Real flashcards structure:', JSON.stringify(realFlashcards, null, 2));
        
        if (realFlashcards && realFlashcards.length > 0) {
          // Converter dados do Firebase para o formato esperado
          const formattedFlashcards: Flashcard[] = realFlashcards.map((card: any) => {
            console.log('Processing card:', card);
            console.log('Card fields:', {
              id: card.id,
              front: card.front,
              back: card.back,
              question: card.question,
              answer: card.answer,
              explanation: card.explanation,
              subTopicId: card.subTopicId,
              order: card.order,
              isActive: card.isActive
            });
            
            const formattedCard = {
              id: card.id,
              subTopicId: card.subTopicId,
              front: card.front || card.question || 'Pergunta não definida', // Suporte para ambos os formatos
              back: card.back || card.answer || 'Resposta não definida', // Suporte para ambos os formatos
              explanation: card.explanation || '',
              order: card.order || 1,
              isActive: card.isActive !== false,
              deepening: card.deepening || '',
              createdAt: card.createdAt,
              updatedAt: card.updatedAt,
            };
            
            // Verificar se os campos estão vazios
            if (!formattedCard.front || formattedCard.front === 'Pergunta não definida') {
              console.warn('Flashcard sem pergunta:', card);
            }
            if (!formattedCard.back || formattedCard.back === 'Resposta não definida') {
              console.warn('Flashcard sem resposta:', card);
            }
            
            // Verificar se os campos estão vazios no card original
            if (!card.front && !card.question) {
              console.error('Card original sem pergunta:', card);
            }
            if (!card.back && !card.answer) {
              console.error('Card original sem resposta:', card);
            }
            
            // Verificar se os campos estão vazios no card formatado
            if (!formattedCard.front || formattedCard.front === 'Pergunta não definida') {
              console.error('Card formatado sem pergunta:', formattedCard);
            }
            if (!formattedCard.back || formattedCard.back === 'Resposta não definida') {
              console.error('Card formatado sem resposta:', formattedCard);
            }
            
            // Verificar se os campos estão sendo processados corretamente
            console.log('Card processing check:', {
              id: card.id,
              originalFront: card.front,
              originalBack: card.back,
              originalQuestion: card.question,
              originalAnswer: card.answer,
              formattedFront: formattedCard.front,
              formattedBack: formattedCard.back,
              frontLength: card.front?.length || 0,
              backLength: card.back?.length || 0,
              frontType: typeof card.front,
              backType: typeof card.back,
              allFields: Object.keys(card),
              cardKeys: Object.keys(card),
              cardValues: Object.values(card),
              cardEntries: Object.entries(card),
              cardStringified: JSON.stringify(card, null, 2),
              cardRaw: card,
              cardNull: card === null,
              cardUndefined: card === undefined,
              cardEmpty: Object.keys(card).length === 0,
              cardHasSubTopicId: !!card.subTopicId,
              cardHasFront: !!card.front,
              cardHasBack: !!card.back,
              cardFrontEmpty: card.front === '',
              cardBackEmpty: card.back === '',
              cardFrontNull: card.front === null,
              cardBackNull: card.back === null,
              cardFrontUndefined: card.front === undefined,
              cardBackUndefined: card.back === undefined,
              cardFrontTruthy: !!card.front,
              cardBackTruthy: !!card.back,
              cardFrontLength: card.front?.length || 0,
              cardBackLength: card.back?.length || 0,
              cardFrontString: String(card.front),
              cardBackString: String(card.back),
              cardFrontTrimmed: card.front?.trim(),
              cardBackTrimmed: card.back?.trim(),
              cardFrontTrimmedLength: card.front?.trim()?.length || 0,
              cardBackTrimmedLength: card.back?.trim()?.length || 0,
              cardFrontTrimmedTruthy: !!card.front?.trim(),
              cardBackTrimmedTruthy: !!card.back?.trim(),
              cardFrontTrimmedEmpty: card.front?.trim() === '',
              cardBackTrimmedEmpty: card.back?.trim() === ''
            });
            console.log('Formatted card:', formattedCard);
            return formattedCard;
          });
          
          console.log('Formatted flashcards:', formattedFlashcards);
          
          // Embaralhar os flashcards para estudo aleatório
          const shuffledFlashcards = [...formattedFlashcards].sort(() => Math.random() - 0.5);
          
          setFlashcards(formattedFlashcards);
          setStudyQueue(shuffledFlashcards);
          setSessionStats(prev => ({ ...prev, totalCards: formattedFlashcards.length }));
          
          // Inicializar sessão de estudo
          setSessionStartTime(new Date());
        } else {
          // Se não há flashcards, mostrar mensagem
          setFlashcards([]);
          setStudyQueue([]);
          setSessionStats(prev => ({ ...prev, totalCards: 0 }));
          toast.error('Nenhum flashcard encontrado para este tópico');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading flashcards:', error);
        toast.error('Erro ao carregar flashcards');
        setLoading(false);
      }
    };

    loadFlashcards();
  }, [courseId, subjectId, topicId, subTopicId, router]);

  const handleCardResponse = (isCorrect: boolean) => {
    if (!user || currentIndex >= studyQueue.length || isTransitioning) return;

    const currentCard = studyQueue[currentIndex];
    
    console.log(`Card response: ${isCorrect ? 'CORRECT' : 'WRONG'} - Card: ${currentCard.front}`);
    
    if (isCorrect) {
      setCompletedCards(prev => [...prev, currentCard]);
      setSessionStats(prev => {
        const newStats = { ...prev, correctCards: prev.correctCards + 1 };
        console.log('Updated session stats (correct):', newStats);
        return newStats;
      });
      
      // Remove o card correto da fila
      setStudyQueue(prev => prev.filter((_, index) => index !== currentIndex));
    } else {
      setWrongCards(prev => [...prev, currentCard]);
      setSessionStats(prev => {
        const newStats = { ...prev, wrongCards: prev.wrongCards + 1 };
        console.log('Updated session stats (wrong):', newStats);
        return newStats;
      });
      
      // Move o card errado para o final da fila para revisão
      setStudyQueue(prev => {
        const newQueue = prev.filter((_, index) => index !== currentIndex);
        return [...newQueue, currentCard];
      });
    }

    // Animate transition
    setIsTransitioning(true);
    setTransitionDirection('right');

    // Move to next card automatically after a short delay
    setTimeout(() => {
      // Se ainda há cards na fila, continua
      if (studyQueue.length > 1) {
        // Se estamos no último card, volta para o início
        if (currentIndex >= studyQueue.length - 1) {
          setCurrentIndex(0);
        } else {
          setCurrentIndex(prev => prev);
        }
        setShowAnswer(false);
      } else {
        // Só finaliza quando não há mais cards na fila
        handleSessionComplete();
      }
      
      // End transition after animation
      setTimeout(() => setIsTransitioning(false), 300);
    }, 1500); // Delay de 1.5 segundos para mostrar o resultado
  };

  const handlePrevious = () => {
    if (currentIndex > 0 && !isTransitioning) {
      setIsTransitioning(true);
      setTransitionDirection('left');
      
      setTimeout(() => {
        setCurrentIndex(prev => prev - 1);
        setShowAnswer(false);
        setTimeout(() => setIsTransitioning(false), 300);
      }, 150);
    }
  };

  const handleNext = () => {
    if (currentIndex < studyQueue.length - 1 && !isTransitioning) {
      setIsTransitioning(true);
      setTransitionDirection('right');
      
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setShowAnswer(false);
        setTimeout(() => setIsTransitioning(false), 300);
      }, 150);
    }
  };

  const handleSessionComplete = async () => {
    if (!user || !sessionStartTime) return;

    const finalStats = {
      totalCards: sessionStats.totalCards,
      correctCards: sessionStats.correctCards,
      wrongCards: sessionStats.wrongCards,
      studyTime: studyTime
    };

    console.log('Session completed with stats:', finalStats);
    setSessionStats(finalStats);
    setSessionCompleted(true);

    // Save session data with correct statistics
    try {
      if (courseId && subjectId && topicId && subTopicId) {
        const sessionData = {
          uid: user.uid,
          courseId,
          subjectId,
          topicId,
          subTopicId,
          flashcardsCount: sessionStats.totalCards,
          correctCards: sessionStats.correctCards,
          wrongCards: sessionStats.wrongCards,
          studyTime: studyTime,
          startTime: sessionStartTime,
          endTime: new Date()
        };
        
        console.log('Saving study session:', sessionData);
        console.log('Session data structure:', {
          uid: sessionData.uid,
          subTopicId: sessionData.subTopicId,
          correctCards: sessionData.correctCards,
          wrongCards: sessionData.wrongCards,
          studyTime: sessionData.studyTime
        });
        
        const sessionId = await createStudySession(sessionData);
        console.log('Study session saved with ID:', sessionId);
        
        // Also update user progress
        const currentProgress = await getUserProgress(user.uid);
        await updateUserProgress(user.uid, {
          lastStudiedAt: new Date(),
          studyTime: (currentProgress?.studyTime || 0) + studyTime,
          cardsStudied: (currentProgress?.cardsStudied || 0) + sessionStats.totalCards,
          cardsCorrect: (currentProgress?.cardsCorrect || 0) + sessionStats.correctCards,
          cardsWrong: (currentProgress?.cardsWrong || 0) + sessionStats.wrongCards
        });
        console.log('User progress updated');
      }
    } catch (error) {
      console.error('Error creating study session:', error)
    }
  };

  const handleDeepening = (content: string) => {
    if (content && content.trim()) {
      setSelectedDeepening(content);
      setShowDeepening(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    // Embaralhar novamente os flashcards
    const shuffledFlashcards = [...flashcards].sort(() => Math.random() - 0.5);
    setStudyQueue(shuffledFlashcards);
    setCompletedCards([]);
    setWrongCards([]);
    setStudyTime(0);
    setSessionStartTime(new Date());
    setSessionCompleted(false);
    setSessionStats({
      totalCards: flashcards.length,
      correctCards: 0,
      wrongCards: 0,
      studyTime: 0
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Calcular progresso baseado apenas nos cards ACERTADOS vs total original
  const totalOriginalCards = flashcards.length;
  const cardsAcertados = completedCards.length;
  const progressPercentage = totalOriginalCards > 0 ? (cardsAcertados / totalOriginalCards) * 100 : 0;
  const remainingCards = Math.max(0, studyQueue.length - 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando flashcards...</p>
        </div>
      </div>
    );
  }

  if (sessionCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sessão Concluída!</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Cards Estudados:</span>
                <span className="font-semibold">{sessionStats.totalCards}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Acertos:</span>
                <span className="font-semibold text-green-600">{sessionStats.correctCards}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Erros:</span>
                <span className="font-semibold text-red-600">{sessionStats.wrongCards}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tempo de Estudo:</span>
                <span className="font-semibold">{formatTime(sessionStats.studyTime)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleRestart}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700"
              >
                Estudar Novamente
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-400"
              >
                Voltar ao Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (studyQueue.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <InformationCircleIcon className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Nenhum Flashcard Disponível</h2>
          <p className="text-gray-600 mb-6">Não há flashcards para estudar neste momento.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-indigo-600 text-white py-3 px-6 rounded-md hover:bg-indigo-700"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentCard = studyQueue[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Voltar
            </button>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {currentIndex + 1} de {studyQueue.length}
              </div>
              <div className="text-sm text-gray-600">
                {formatTime(studyTime)}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progresso da Sessão</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className="bg-indigo-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ 
                type: "spring", 
                stiffness: 100, 
                damping: 20,
                duration: 0.5
              }}
            />
          </div>
          
          {/* Session Stats */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <motion.div 
              className="text-center"
              key={`correct-${sessionStats.correctCards}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-2xl font-bold text-green-600">{sessionStats.correctCards}</div>
              <div className="text-xs text-gray-600">Acertos</div>
            </motion.div>
            <motion.div 
              className="text-center"
              key={`wrong-${sessionStats.wrongCards}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-2xl font-bold text-red-600">{sessionStats.wrongCards}</div>
              <div className="text-xs text-gray-600">Erros</div>
            </motion.div>
            <motion.div 
              className="text-center"
              key={`remaining-${remainingCards}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-2xl font-bold text-blue-600">{remainingCards}</div>
              <div className="text-xs text-gray-600">Restantes</div>
            </motion.div>
          </div>
        </div>

        {/* Flashcard */}
        {currentCard && studyQueue.length > 0 ? (
          <motion.div 
            className="mb-8"
            key={`${currentCard.id}-${currentIndex}`}
            initial={{ 
              opacity: 0, 
              x: transitionDirection === 'right' ? 100 : -100,
              scale: 0.9
            }}
            animate={{ 
              opacity: 1, 
              x: 0,
              scale: 1
            }}
            exit={{ 
              opacity: 0, 
              x: transitionDirection === 'right' ? -100 : 100,
              scale: 0.9
            }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              duration: 0.3
            }}
          >
            <FlashcardComponent
              flashcard={currentCard}
              onAnswer={(status) => {
                if (status === 'learned') {
                  handleCardResponse(true);
                } else if (status === 'wrong') {
                  handleCardResponse(false);
                }
              }}
              onDeepen={() => handleDeepening(currentCard?.deepening || '')}
              showDeepen={!!(currentCard?.deepening && currentCard.deepening.trim())}
            />
          </motion.div>
        ) : (
          <div className="mb-8 text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Sessão Concluída!</h2>
              <p className="text-gray-600 mb-6">Todos os cards foram estudados corretamente.</p>
              <div className="mb-6 text-sm text-gray-500">
                <p>Cards acertados: {sessionStats.correctCards}</p>
                <p>Cards errados: {sessionStats.wrongCards}</p>
                <p>Tempo total: {formatTime(studyTime)}</p>
              </div>
              <button
                onClick={handleRestart}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Reiniciar Sessão
              </button>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        {currentCard && studyQueue.length > 0 && (
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                currentIndex === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ChevronLeftIcon className="w-5 h-5 mr-1" />
              Anterior
            </button>

            <div className="flex space-x-4">
              <motion.button
                onClick={() => handleCardResponse(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                disabled={isTransitioning}
              >
                <XCircleIcon className="w-5 h-5" />
                <span>Errei (1)</span>
              </motion.button>
              <motion.button
                onClick={() => handleCardResponse(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                disabled={isTransitioning}
              >
                <CheckCircleIcon className="w-5 h-5" />
                <span>Acertei (2)</span>
              </motion.button>
            </div>

            <button
              onClick={handleNext}
              disabled={currentIndex >= studyQueue.length - 1}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                currentIndex >= studyQueue.length - 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Próximo
              <ChevronRightIcon className="w-5 h-5 ml-1" />
            </button>
          </div>
        )}
      </div>

      {/* Deepening Modal */}
      {showDeepening && selectedDeepening && (
        <DeepeningModal
          isOpen={showDeepening}
          onClose={() => setShowDeepening(false)}
          deepening={{
            id: '1',
            flashcardId: currentCard.id,
            title: 'Aprofundamento',
            content: selectedDeepening,
            images: [],
            videos: [],
            pdfs: [],
            externalLinks: [],
            isActive: true
          }}
        />
      )}
    </div>
  );
} 