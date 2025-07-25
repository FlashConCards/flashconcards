'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, 
  ArrowLeft, 
  RotateCcw, 
  Check, 
  X,
  BarChart3,
  Clock,
  Target,
  ChevronRight
} from 'lucide-react'
import { getDashboardUrl } from '../../lib/auth'
import { saveCardProgress, getTopicProgress } from '../../lib/progress'
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface Flashcard {
  id: string
  question: string
  answer: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  topic: string
  subtopico?: string
}

interface Topic {
  id: string
  name: string
  description: string
  cardCount: number
  icon: any
  color: string
}

// Função utilitária para obter histórico de respostas do usuário para cada card
function getCardHistory(subjectId: string, topicId: string, cardId: string): string[] {
  if (typeof window === 'undefined') return [];
  const key = `flashconcards_history_${subjectId}_${topicId}_${cardId}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

// Função utilitária para salvar resposta no histórico
function saveCardHistory(subjectId: string, topicId: string, cardId: string, result: 'acertou' | 'errou') {
  if (typeof window === 'undefined') return;
  const key = `flashconcards_history_${subjectId}_${topicId}_${cardId}`;
  const data = localStorage.getItem(key);
  const history = data ? JSON.parse(data) : [];
  history.push(result);
  localStorage.setItem(key, JSON.stringify(history));
}

// Função para classificar dificuldade baseada no histórico
function getDynamicDifficulty(subjectId: string, topicId: string, cardId: string): 'easy' | 'medium' | 'hard' {
  const history = getCardHistory(subjectId, topicId, cardId);
  if (history.length === 0) return 'medium';
  // Se acertou as 2 últimas vezes seguidas
  if (history.slice(-2).every((r: string) => r === 'acertou')) return 'easy';
  // Se acertou na segunda tentativa
  if (history.length >= 2 && history[history.length - 2] === 'errou' && history[history.length - 1] === 'acertou') return 'medium';
  // Se errou 2 vezes ou mais antes de acertar
  const errosAntesAcerto = history.join(',').split('acertou').length - 1 < 1 && history.filter((r: string) => r === 'errou').length >= 2;
  if (errosAntesAcerto) return 'hard';
  // Se errou a última
  if (history[history.length - 1] === 'errou') return 'hard';
  return 'medium';
}

// Função para normalizar o ID do subtópico igual ao admin
function normalizeSubtopicId(name: string) {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_');
}

export default function StudyPage({ params }: { params: { subject: string } }) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [studySession, setStudySession] = useState({
    totalCards: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    timeSpent: 0
  })
  const [sessionCompleted, setSessionCompleted] = useState(false)
  const [remainingCards, setRemainingCards] = useState<Flashcard[]>([])
  const [completedCards, setCompletedCards] = useState<Set<string>>(new Set())
  const [recentlyCompletedCards, setRecentlyCompletedCards] = useState<Set<string>>(new Set())
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [showTopicSelection, setShowTopicSelection] = useState(true)
  const [cardsSeenSinceLastCompleted, setCardsSeenSinceLastCompleted] = useState(0)
  const [firebaseFlashcards, setFirebaseFlashcards] = useState<Flashcard[]>([]);
  // Adicionar estado para modal de aprofundamento
  const [showDeepenModal, setShowDeepenModal] = useState(false);
  const [deepenContent, setDeepenContent] = useState<string>('');
  const [deepenTitle, setDeepenTitle] = useState<string>('');

  // Flashcards organizados por matéria
  const getFlashcardsBySubject = (subjectId: string): Flashcard[] => {
    const flashcardsBySubject: { [key: string]: Flashcard[] } = {
      'portugues': [
        {
          id: '1',
          question: 'Qual é a função da vírgula na frase "João, que é estudante, passou no concurso"?',
          answer: 'A vírgula está sendo usada para isolar a oração adjetiva explicativa "que é estudante", que fornece uma informação adicional sobre João.',
          category: 'Língua Portuguesa',
          difficulty: 'medium',
          topic: 'Ortografia'
        },
        {
          id: '2',
          question: 'Identifique o sujeito da oração: "Os candidatos estudaram muito para o concurso".',
          answer: 'O sujeito é "Os candidatos" - sujeito simples, determinado, composto.',
          category: 'Língua Portuguesa',
          difficulty: 'easy',
          topic: 'Ortografia'
        },
        {
          id: '3',
          question: 'Qual é a diferença entre "mal" e "mau"?',
          answer: '"Mal" é advérbio de modo (opõe-se a "bem"), enquanto "mau" é adjetivo (opõe-se a "bom").',
          category: 'Língua Portuguesa',
          difficulty: 'easy',
          topic: 'Ortografia'
        },
        {
          id: '4',
          question: 'O que é uma oração subordinada adjetiva?',
          answer: 'É uma oração que funciona como adjetivo, modificando um substantivo. Pode ser restritiva ou explicativa.',
          category: 'Língua Portuguesa',
          difficulty: 'medium',
          topic: 'Ortografia'
        },
        {
          id: '5',
          question: 'Qual é a regra de acentuação para palavras paroxítonas terminadas em "a"?',
          answer: 'Palavras paroxítonas terminadas em "a" são acentuadas quando terminam em vogal + a (ex: má, pá).',
          category: 'Língua Portuguesa',
          difficulty: 'medium',
          topic: 'Ortografia'
        }
      ],
      'informatica': [
        {
          id: '1',
          question: 'O que é um firewall e qual sua função principal?',
          answer: 'Firewall é um sistema de segurança que controla o tráfego de rede, bloqueando acessos não autorizados e protegendo contra ataques.',
          category: 'Noções de Informática',
          difficulty: 'medium',
          topic: 'Segurança'
        },
        {
          id: '2',
          question: 'Como criar uma fórmula no Excel para somar valores de A1 até A10?',
          answer: 'Use a fórmula =SOMA(A1:A10) ou =SUM(A1:A10) para somar todos os valores do intervalo A1 até A10.',
          category: 'Noções de Informática',
          difficulty: 'easy',
          topic: 'Excel'
        },
        {
          id: '3',
          question: 'O que é phishing e como se proteger?',
          answer: 'Phishing é um tipo de fraude que tenta roubar dados pessoais através de emails falsos. Proteja-se verificando o remetente e não clicando em links suspeitos.',
          category: 'Noções de Informática',
          difficulty: 'medium',
          topic: 'Segurança'
        },
        {
          id: '4',
          question: 'Qual a diferença entre hardware e software?',
          answer: 'Hardware são os componentes físicos do computador (CPU, memória, disco), enquanto software são os programas e sistemas operacionais.',
          category: 'Noções de Informática',
          difficulty: 'easy',
          topic: 'Hardware'
        },
        {
          id: '5',
          question: 'Como fazer backup de arquivos importantes?',
          answer: 'Use serviços em nuvem (Google Drive, OneDrive), HDs externos ou pendrives. Mantenha múltiplas cópias em locais diferentes.',
          category: 'Noções de Informática',
          difficulty: 'easy',
          topic: 'Backup'
        }
      ],
      'constitucional': [
        {
          id: '1',
          question: 'Quais são os direitos e garantias fundamentais previstos na Constituição Federal?',
          answer: 'Os direitos e garantias fundamentais incluem: direito à vida, liberdade, igualdade, segurança, propriedade, entre outros previstos no art. 5º da CF.',
          category: 'Direito Constitucional',
          difficulty: 'hard',
          topic: 'Direitos'
        },
        {
          id: '2',
          question: 'O que é o princípio da supremacia constitucional?',
          answer: 'É o princípio que estabelece que a Constituição é a norma suprema do ordenamento jurídico, sendo todas as outras normas hierarquicamente inferiores.',
          category: 'Direito Constitucional',
          difficulty: 'medium',
          topic: 'Direitos'
        },
        {
          id: '3',
          question: 'Quais são os Poderes da União e suas funções?',
          answer: 'Legislativo (fazer leis), Executivo (administrar) e Judiciário (julgar). Cada poder tem funções típicas e atípicas.',
          category: 'Direito Constitucional',
          difficulty: 'medium',
          topic: 'Poderes'
        },
        {
          id: '4',
          question: 'O que são direitos sociais?',
          answer: 'São direitos previstos no art. 6º da CF, como educação, saúde, trabalho, moradia, lazer, segurança, previdência social, proteção à maternidade e à infância.',
          category: 'Direito Constitucional',
          difficulty: 'medium',
          topic: 'Direitos'
        },
        {
          id: '5',
          question: 'Qual é a função do Supremo Tribunal Federal?',
          answer: 'O STF é a instância máxima do Poder Judiciário, responsável pela guarda da Constituição e julgamento de questões constitucionais.',
          category: 'Direito Constitucional',
          difficulty: 'hard',
          topic: 'Poder Judiciário'
        }
      ],
      'administrativo': [
        {
          id: '1',
          question: 'Qual é o princípio fundamental da Administração Pública que garante que os atos administrativos devem estar em conformidade com a lei?',
          answer: 'O princípio da legalidade, que estabelece que a Administração Pública só pode agir conforme a lei autoriza.',
          category: 'Direito Administrativo',
          difficulty: 'medium',
          topic: 'Legalidade'
        },
        {
          id: '2',
          question: 'O que são atos administrativos e quais seus atributos?',
          answer: 'Atos administrativos são manifestações de vontade da Administração. Seus atributos são: presunção de legitimidade, imperatividade e autoexecutoriedade.',
          category: 'Direito Administrativo',
          difficulty: 'medium',
          topic: 'Atos Administrativos'
        },
        {
          id: '3',
          question: 'Quais são os princípios da Administração Pública?',
          answer: 'Legalidade, impessoalidade, moralidade, publicidade e eficiência (LIMPE).',
          category: 'Direito Administrativo',
          difficulty: 'easy',
          topic: 'Princípios'
        },
        {
          id: '4',
          question: 'O que é licitação e quando é obrigatória?',
          answer: 'Licitação é o procedimento para escolha da melhor proposta. É obrigatória para contratação de obras, serviços e compras pela Administração Pública.',
          category: 'Direito Administrativo',
          difficulty: 'medium',
          topic: 'Licitação'
        },
        {
          id: '5',
          question: 'O que é responsabilidade civil do Estado?',
          answer: 'É a obrigação do Estado de reparar danos causados a terceiros por seus agentes, independentemente de culpa (responsabilidade objetiva).',
          category: 'Direito Administrativo',
          difficulty: 'hard',
          topic: 'Responsabilidade'
        }
      ],
      'realidade-goias': [
        {
          id: '1',
          question: 'Quais são os principais aspectos geográficos de Goiás?',
          answer: 'Goiás possui relevo predominantemente planáltico, clima tropical, vegetação de cerrado, e é cortado por importantes rios como o Araguaia e o Tocantins.',
          category: 'Realidade de Goiás',
          difficulty: 'medium',
          topic: 'Geografia'
        },
        {
          id: '2',
          question: 'Qual é a capital de Goiás e quando foi fundada?',
          answer: 'Goiânia é a capital, fundada em 24 de outubro de 1933, sendo uma das primeiras cidades planejadas do Brasil.',
          category: 'Realidade de Goiás',
          difficulty: 'easy',
          topic: 'História'
        },
        {
          id: '3',
          question: 'Quais são os principais produtos agrícolas de Goiás?',
          answer: 'Soja, milho, arroz, feijão, algodão, cana-de-açúcar e frutas como goiaba, manga e abacaxi.',
          category: 'Realidade de Goiás',
          difficulty: 'easy',
          topic: 'Agricultura'
        },
        {
          id: '4',
          question: 'Qual é a importância econômica de Goiás?',
          answer: 'Goiás é importante produtor agrícola, tem indústria diversificada, mineração (níquel, ouro) e forte setor de serviços.',
          category: 'Realidade de Goiás',
          difficulty: 'medium',
          topic: 'Economia'
        },
        {
          id: '5',
          question: 'Quais são as principais cidades de Goiás?',
          answer: 'Goiânia (capital), Aparecida de Goiânia, Anápolis, Rio Verde, Luziânia, Águas Lindas de Goiás e Trindade.',
          category: 'Realidade de Goiás',
          difficulty: 'easy',
          topic: 'Cidades'
        }
      ],
      'legislacao-alego': [
        {
          id: '1',
          question: 'Qual é a estrutura da Assembleia Legislativa de Goiás?',
          answer: 'A ALEGO é composta por 41 deputados estaduais, eleitos por voto proporcional, com mandato de 4 anos.',
          category: 'Legislação ALEGO',
          difficulty: 'easy',
          topic: 'Estrutura'
        },
        {
          id: '2',
          question: 'Quais são as principais funções da ALEGO?',
          answer: 'Legislar sobre assuntos de interesse estadual, fiscalizar o Executivo, aprovar orçamentos e nomear autoridades.',
          category: 'Legislação ALEGO',
          difficulty: 'medium',
          topic: 'Funções'
        },
        {
          id: '3',
          question: 'O que é o Regimento Interno da ALEGO?',
          answer: 'É o documento que estabelece as normas de funcionamento da Assembleia, incluindo procedimentos legislativos e administrativos.',
          category: 'Legislação ALEGO',
          difficulty: 'medium',
          topic: 'Regimento'
        },
        {
          id: '4',
          question: 'Como funciona o processo legislativo na ALEGO?',
          answer: 'Inicia com projeto de lei, passa por comissões, votações em plenário e sanção do governador.',
          category: 'Legislação ALEGO',
          difficulty: 'medium',
          topic: 'Processo Legislativo'
        },
        {
          id: '5',
          question: 'Quais são as comissões permanentes da ALEGO?',
          answer: 'Comissões de Constituição, Finanças, Orçamento, Agricultura, Educação, Saúde, Segurança, entre outras.',
          category: 'Legislação ALEGO',
          difficulty: 'hard',
          topic: 'Comissões'
        }
      ]
    }
    return flashcardsBySubject[subjectId] || []
  }

  // Obter tópicos de cada matéria
  const topics = Array.from(new Set(firebaseFlashcards.map(card => card.subtopico || card.topic))).filter(Boolean).map((sub, idx) => ({
    id: sub,
    name: sub,
    description: '',
    cardCount: firebaseFlashcards.filter(card => (card.subtopico || card.topic) === sub).length,
    icon: BookOpen,
    color: 'bg-blue-500'
  }));
  
  const flashcards = getFlashcardsBySubject(params.subject)
  
  // Filtrar cards por tópico selecionado
  const filteredFlashcards = selectedTopic 
    ? (firebaseFlashcards.length > 0
        ? firebaseFlashcards.filter(card => card.topic === selectedTopic || card.subtopico === selectedTopic)
        : getFlashcardsBySubject(params.subject).filter(card => card.topic === selectedTopic || card.subtopico === selectedTopic)
      )
    : (firebaseFlashcards.length > 0 ? firebaseFlashcards : getFlashcardsBySubject(params.subject));

  const currentCard = sessionCompleted ? null : (remainingCards[currentCardIndex] || filteredFlashcards[0] || null)

  // Função para mapear slug para nome da matéria
  const getSubjectNameFromSlug = (slug: string) => {
    const map: { [key: string]: string } = {
      'portugues': 'Língua Portuguesa',
      'lingua-portuguesa': 'Língua Portuguesa',
      'l-ngua-portuguesa': 'Língua Portuguesa',
      'informatica': 'Noções de Informática',
      'noes-de-informatica': 'Noções de Informática',
      'direito-constitucional': 'Direito Constitucional',
      'constitucional': 'Direito Constitucional',
      'direito-administrativo': 'Direito Administrativo',
      'administrativo': 'Direito Administrativo',
      'realidade-goias': 'Realidade de Goiás',
      'realidade-de-goias': 'Realidade de Goiás',
      'legislacao-alego': 'Legislação ALEGO',
      'legislação-alego': 'Legislação ALEGO'
    };
    return map[slug] || slug;
  };

  // Buscar flashcards do Firebase ao selecionar matéria/tópico
  useEffect(() => {
    if (!params.subject) return;
    const subjectName = getSubjectNameFromSlug(params.subject);
    let q = query(collection(db, 'flashcards'), where('subject', '==', subjectName));
    const unsub = onSnapshot(q, (snapshot) => {
      const cards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Flashcard[];
      setFirebaseFlashcards(cards);
    });
    return () => unsub();
  }, [params.subject]);

  // Timer separado para garantir que funcione corretamente
  useEffect(() => {
    if (sessionCompleted) return
    
    const timer = setInterval(() => {
      setStudySession(prev => ({ ...prev, timeSpent: prev.timeSpent + 1 }))
    }, 1000)

    return () => clearInterval(timer)
  }, [sessionCompleted])

  // Verificar se a sessão deve ser marcada como completa
  useEffect(() => {
    // Sessão completa quando todos os cards foram acertados
    if (studySession.correctAnswers >= studySession.totalCards && studySession.totalCards > 0) {
      setSessionCompleted(true)
    }
    // Ou quando não há mais cards restantes
    else if (remainingCards.length === 0 && studySession.totalCards > 0) {
      setSessionCompleted(true)
    }
  }, [studySession.correctAnswers, studySession.totalCards, remainingCards.length])

  const handleTopicSelection = (topicId: string) => {
    setSelectedTopic(topicId)
    setShowTopicSelection(false)
    setCurrentCardIndex(0)
    setIsFlipped(false)
    setSessionCompleted(false)
    setCompletedCards(new Set())
    setRecentlyCompletedCards(new Set())
    // Inicializar os cards do tópico selecionado
    const initialCards = topicId
      ? (firebaseFlashcards.length > 0
          ? firebaseFlashcards.filter(card => card.topic === topicId || card.subtopico === topicId)
          : getFlashcardsBySubject(params.subject).filter(card => card.topic === topicId || card.subtopico === topicId)
        )
      : (firebaseFlashcards.length > 0 ? firebaseFlashcards : getFlashcardsBySubject(params.subject));
    setRemainingCards(initialCards)
    setStudySession({
      totalCards: initialCards.length,
      correctAnswers: 0,
      incorrectAnswers: 0,
      timeSpent: 0
    })
  }

  const handleCardFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleAnswer = (isCorrect: boolean) => {
    if (!currentCard) return
    
    const currentCardId = currentCard.id
    
    if (isCorrect) {
      // Se acertou, remove o card da lista de cards restantes
      setRemainingCards(prev => {
        const newArr = prev.filter(card => card.id !== currentCardId)
        // Se não há mais cards, marcar sessão como completa
        if (newArr.length === 0) setSessionCompleted(true)
        return newArr
      })
      setCompletedCards(prev => new Set(Array.from(prev).concat([currentCardId])))
      setRecentlyCompletedCards(prev => new Set(Array.from(prev).concat([currentCardId])))
      if (selectedTopic) {
        saveCardProgress(params.subject, selectedTopic, currentCardId, filteredFlashcards.length)
      }
      setStudySession(prev => ({
        ...prev,
        correctAnswers: prev.correctAnswers + 1
      }))
      setIsFlipped(false)
      setCurrentCardIndex(0)
    } else {
      // Se errou, move o card para o final da fila
      setRemainingCards(prev => {
        if (prev.length <= 1) return prev
        const newArr = prev.slice()
        const [errado] = newArr.splice(currentCardIndex, 1)
        newArr.push(errado)
        return newArr
      })
      setStudySession(prev => ({
        ...prev,
        incorrectAnswers: prev.incorrectAnswers + 1
      }))
      setIsFlipped(false)
      setCurrentCardIndex(0)
    }
  }

  const handleRestart = () => {
    setCurrentCardIndex(0)
    setIsFlipped(false)
    setSessionCompleted(false)
    setCompletedCards(new Set())
    setRecentlyCompletedCards(new Set())
    // Recarregar os cards do tópico selecionado
    const initialCards = selectedTopic
      ? (firebaseFlashcards.length > 0
          ? firebaseFlashcards.filter(card => card.topic === selectedTopic || card.subtopico === selectedTopic)
          : getFlashcardsBySubject(params.subject).filter(card => card.topic === selectedTopic || card.subtopico === selectedTopic)
        )
      : (firebaseFlashcards.length > 0 ? firebaseFlashcards : getFlashcardsBySubject(params.subject));
    setRemainingCards(initialCards)
    setStudySession({
      totalCards: initialCards.length,
      correctAnswers: 0,
      incorrectAnswers: 0,
      timeSpent: 0
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getSubjectName = (subjectId: string) => {
    const subjects: { [key: string]: string } = {
      'portugues': 'Língua Portuguesa',
      'informatica': 'Noções de Informática',
      'constitucional': 'Direito Constitucional',
      'administrativo': 'Direito Administrativo',
      'realidade-goias': 'Realidade de Goiás',
      'legislacao-alego': 'Legislação ALEGO'
    }
    return subjects[subjectId] || 'Matéria'
  }

  const isSessionComplete = sessionCompleted

  // Função para buscar conteúdo adicional do Firestore
  async function fetchDeepenContent(topicId: string) {
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('../../lib/firebase');
      const subtopicRef = doc(db, 'subtopics', normalizeSubtopicId(topicId));
      const subtopicSnap = await getDoc(subtopicRef);
      if (subtopicSnap.exists()) {
        const data = subtopicSnap.data();
        setDeepenContent(data.extraContent || '');
        setDeepenTitle(data.name || 'Aprofundamento');
      } else {
        setDeepenContent('Conteúdo de aprofundamento não encontrado.');
        setDeepenTitle('Aprofundamento');
      }
      setShowDeepenModal(true);
    } catch (e) {
      setDeepenContent('Erro ao buscar conteúdo de aprofundamento.');
      setDeepenTitle('Aprofundamento');
      setShowDeepenModal(true);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <a href={getDashboardUrl()} className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-6 w-6" />
              </a>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {getSubjectName(params.subject)}
                </h1>
                {selectedTopic && (
                  <p className="text-sm text-gray-600">
                    Tópico: {topics.find(t => t.id === selectedTopic)?.name}
                  </p>
                )}
              </div>
            </div>
            {!showTopicSelection && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(studySession.timeSpent)}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Target className="h-4 w-4" />
                  <span>{studySession.correctAnswers}/{studySession.totalCards}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showTopicSelection ? (
          /* Topic Selection */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Escolha um Tópico
              </h2>
              <p className="text-lg text-gray-600">
                Selecione o tópico que você deseja estudar em {getSubjectName(params.subject)}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topics.map((topic, index) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer border-2 border-transparent hover:border-primary-200"
                  onClick={() => handleTopicSelection(topic.id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${topic.color}`}>
                      <topic.icon className="h-6 w-6 text-white" />
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {topic.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {topic.description}
                  </p>
                  
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-500">{topic.cardCount} cards</span>
                    <span className="text-sm font-medium text-primary-600">Estudar</span>
                    <button
                      type="button"
                      className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-200 transition-colors"
                      onClick={e => { e.stopPropagation(); fetchDeepenContent(topic.id); }}
                    >
                      Aprofundar
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          /* Study Session */
          <>
            {!isSessionComplete ? (
              <>
                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progresso</span>
                    <span>{Math.min(100, Math.round((studySession.correctAnswers / studySession.totalCards) * 100))}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (studySession.correctAnswers / studySession.totalCards) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Flashcard */}
                {currentCard ? (
                  <motion.div
                    key={currentCardIndex}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="mb-8"
                  >
                    <div 
                      className="flashcard cursor-pointer"
                      onClick={handleCardFlip}
                    >
                      <AnimatePresence mode="wait">
                        {!isFlipped ? (
                          <motion.div
                            key="front"
                            initial={{ opacity: 0, rotateY: -90 }}
                            animate={{ opacity: 1, rotateY: 0 }}
                            exit={{ opacity: 0, rotateY: 90 }}
                            transition={{ duration: 0.3 }}
                            className="flashcard-front"
                          >
                            <div className="mb-4">
                              <span className="inline-block bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                {currentCard.category}
                              </span>
                              <span className={`ml-2 inline-block text-xs font-medium px-2.5 py-0.5 rounded ${(() => {
                                const diff = getDynamicDifficulty(params.subject, selectedTopic || currentCard.topic, currentCard.id);
                                if (diff === 'easy') return 'bg-green-100 text-green-800';
                                if (diff === 'medium') return 'bg-yellow-100 text-yellow-800';
                                return 'bg-red-100 text-red-800';
                              })()}`}> 
                                {(() => {
                                  const diff = getDynamicDifficulty(params.subject, selectedTopic || currentCard.topic, currentCard.id);
                                  if (diff === 'easy') return 'Fácil';
                                  if (diff === 'medium') return 'Médio';
                                  return 'Difícil';
                                })()}
                              </span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                              Pergunta
                            </h3>
                            <p className="text-lg text-gray-700 leading-relaxed">
                              {currentCard.question}
                            </p>
                            <p className="text-sm text-gray-500 mt-4">
                              Clique para ver a resposta
                            </p>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="back"
                            initial={{ opacity: 0, rotateY: 90 }}
                            animate={{ opacity: 1, rotateY: 0 }}
                            exit={{ opacity: 0, rotateY: -90 }}
                            transition={{ duration: 0.3 }}
                            className="flashcard-back"
                          >
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                              Resposta
                            </h3>
                            <p className="text-lg text-gray-700 leading-relaxed mb-6">
                              {currentCard.answer}
                            </p>
                            <p className="text-sm text-gray-500">
                              Como você se saiu com esta questão?
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Nenhum card disponível para este tópico.</p>
                  </div>
                )}

                {/* Answer Buttons */}
                {isFlipped && currentCard && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-center space-x-4"
                  >
                    <button
                      onClick={() => { handleAnswer(false); saveCardHistory(params.subject, selectedTopic || currentCard.topic, currentCard.id, 'errou'); }}
                      className="flex items-center px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                    >
                      <X className="h-5 w-5 mr-2" />
                      Errei
                    </button>
                    <button
                      onClick={() => { handleAnswer(true); saveCardHistory(params.subject, selectedTopic || currentCard.topic, currentCard.id, 'acertou'); }}
                      className="flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
                    >
                      <Check className="h-5 w-5 mr-2" />
                      Acertei
                    </button>
                  </motion.div>
                )}
              </>
            ) : (
              /* Session Complete */
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="bg-white rounded-xl p-8 shadow-lg max-w-md mx-auto">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Sessão Concluída!
                  </h2>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tempo total:</span>
                      <span className="font-medium">{formatTime(studySession.timeSpent)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Acertos:</span>
                      <span className="font-medium text-green-600">{studySession.correctAnswers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Erros:</span>
                      <span className="font-medium text-red-600">{studySession.incorrectAnswers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxa de acerto:</span>
                      <span className="font-medium">
                        {Math.round((studySession.correctAnswers / studySession.totalCards) * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <button
                      onClick={handleRestart}
                      className="w-full btn-primary"
                    >
                      <RotateCcw className="h-5 w-5 mr-2" />
                      Estudar Novamente
                    </button>
                    <button
                      onClick={() => setShowTopicSelection(true)}
                      className="w-full btn-secondary"
                    >
                      Escolher Outro Tópico
                    </button>
                    <a
                      href={getDashboardUrl()}
                      className="block w-full btn-secondary text-center"
                    >
                      Voltar ao Dashboard
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
      {/* Modal de aprofundamento */}
      {showDeepenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowDeepenModal(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-4">{deepenTitle}</h2>
            <div className="text-gray-700 prose max-w-none" dangerouslySetInnerHTML={{ __html: deepenContent }} />
          </div>
        </div>
      )}
    </div>
  )
} 