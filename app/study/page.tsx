'use client';

import { useState, useEffect } from 'react';
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
  InformationCircleIcon
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

  // Get course info from URL params
  const courseId = searchParams.get('courseId');
  const subjectId = searchParams.get('subjectId');
  const topicId = searchParams.get('topicId');
  const subTopicId = searchParams.get('subTopicId');
  
  console.log('Study page params:', { courseId, subjectId, topicId, subTopicId });

  // Timer effect
  useEffect(() => {
    if (!sessionStartTime) return;

    const interval = setInterval(() => {
      setStudyTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

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
        
        if (realFlashcards && realFlashcards.length > 0) {
          // Converter dados do Firebase para o formato esperado
          const formattedFlashcards: Flashcard[] = realFlashcards.map((card: any) => ({
            id: card.id,
            subTopicId: card.subTopicId,
            front: card.front || card.question, // Suporte para ambos os formatos
            back: card.back || card.answer, // Suporte para ambos os formatos
            explanation: card.explanation || '',
            order: card.order || 1,
            isActive: card.isActive !== false,
            deepening: card.deepening || '',
            createdAt: card.createdAt,
            updatedAt: card.updatedAt,
          }));
          
          console.log('Formatted flashcards:', formattedFlashcards);
          
          setFlashcards(formattedFlashcards);
          setStudyQueue([...formattedFlashcards]);
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
    if (!user || currentIndex >= studyQueue.length) return;

    const currentCard = studyQueue[currentIndex];
    
    if (isCorrect) {
      setCompletedCards(prev => [...prev, currentCard]);
      setSessionStats(prev => ({ ...prev, correctCards: prev.correctCards + 1 }));
    } else {
      setWrongCards(prev => [...prev, currentCard]);
      setSessionStats(prev => ({ ...prev, wrongCards: prev.wrongCards + 1 }));
      
      // Add wrong card back to the end of the queue
      setStudyQueue(prev => [...prev.slice(currentIndex + 1), currentCard]);
    }

    // Move to next card
    if (currentIndex + 1 < studyQueue.length) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      // Session completed
      handleSessionComplete();
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

    setSessionStats(finalStats);
    setSessionCompleted(true);

    // Save session data
    try {
      if (courseId && subjectId && topicId && subTopicId) {
        await createStudySession({
          uid: user.uid,
          courseId,
          subjectId,
          topicId,
          subTopicId,
          flashcardsCount: flashcards.length,
          startTime: new Date()
        })
      }
    } catch (error) {
      console.error('Error creating study session:', error)
    }
  };

  const handleDeepening = (content: string) => {
    setSelectedDeepening(content);
    setShowDeepening(true);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setStudyQueue([...flashcards]);
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
            <span>Progresso</span>
            <span>{Math.round(((currentIndex + 1) / studyQueue.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / studyQueue.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Flashcard */}
        <div className="mb-8">
          <FlashcardComponent
            flashcard={currentCard}
            onAnswer={(status) => {
              if (status === 'learned') {
                handleCardResponse(true);
              } else if (status === 'wrong') {
                handleCardResponse(false);
              }
            }}
            onDeepen={() => handleDeepening(currentCard.deepening || '')}
            showDeepen={!!currentCard.deepening}
          />
        </div>

        {/* Answer Buttons */}
        {showAnswer && (
          <div className="flex space-x-4">
            <button
              onClick={() => handleCardResponse(false)}
              className="flex-1 bg-red-600 text-white py-4 px-6 rounded-lg hover:bg-red-700 flex items-center justify-center"
            >
              <XCircleIcon className="w-6 h-6 mr-2" />
              Errei
            </button>
            <button
              onClick={() => handleCardResponse(true)}
              className="flex-1 bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 flex items-center justify-center"
            >
              <CheckCircleIcon className="w-6 h-6 mr-2" />
              Acertei
            </button>
          </div>
        )}
      </div>

      {/* Deepening Modal */}
      {showDeepening && (
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