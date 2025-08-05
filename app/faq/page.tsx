'use client';

import { useState } from 'react';
import { 
  ArrowLeftIcon, 
  ChevronDownIcon,
  ChevronUpIcon,
  QuestionMarkCircleIcon,
  AcademicCapIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

const faqCategories = [
  {
    id: 'general',
    title: 'Geral',
    icon: QuestionMarkCircleIcon,
    questions: [
      {
        question: 'O que é o FlashConCards?',
        answer: 'O FlashConCards é uma plataforma de estudo baseada em flashcards que utiliza a técnica de repetição espaçada para maximizar a retenção de conhecimento. Nossa tecnologia adaptativa personaliza o estudo de acordo com seu ritmo de aprendizado.'
      },
      {
        question: 'Como funciona o método de flashcards?',
        answer: 'Nosso sistema mostra os cards no momento ideal para revisão, baseado na curva do esquecimento. Quanto mais você erra um card, mais frequentemente ele aparece. Quanto mais acerta, menos aparece, otimizando seu tempo de estudo.'
      },
      {
        question: 'Preciso instalar algum aplicativo?',
        answer: 'Não! O FlashConCards funciona totalmente no navegador. Você pode acessar de qualquer dispositivo com internet - computador, tablet ou celular.'
      },
      {
        question: 'Posso estudar offline?',
        answer: 'Atualmente não, mas estamos trabalhando em uma versão offline. Por enquanto, você precisa de conexão com a internet para acessar o conteúdo.'
      }
    ]
  },
  {
    id: 'study',
    title: 'Estudos',
    icon: AcademicCapIcon,
    questions: [
      {
        question: 'Como começar a estudar?',
        answer: '1. Faça login na sua conta\n2. Escolha um curso na área de estudos\n3. Selecione uma matéria\n4. Escolha um tópico\n5. Clique em "Estudar" e comece com os flashcards!'
      },
      {
        question: 'Quantos flashcards devo estudar por dia?',
        answer: 'Recomendamos estudar entre 20-50 cards por dia, dependendo do seu tempo disponível. É melhor estudar um pouco todos os dias do que muito de uma vez.'
      },
      {
        question: 'O que são os aprofundamentos?',
        answer: 'Os aprofundamentos são conteúdos extras que complementam os flashcards. Eles incluem explicações detalhadas, exemplos práticos e dicas de estudo para cada tópico.'
      },
      {
        question: 'Como funciona o sistema de progresso?',
        answer: 'O sistema acompanha quantos cards você estudou, sua taxa de acerto e o tempo de estudo. Você pode ver estatísticas detalhadas na área de estudos.'
      }
    ]
  },
  {
    id: 'payment',
    title: 'Pagamentos',
    icon: CreditCardIcon,
    questions: [
      {
        question: 'Quais são as formas de pagamento?',
        answer: 'Aceitamos cartões de crédito, débito e PIX através do MercadoPago. Todos os pagamentos são processados de forma segura.'
      },
      {
        question: 'Posso cancelar minha assinatura?',
        answer: 'Sim! Você pode cancelar a qualquer momento através das configurações da sua conta. O acesso permanecerá ativo até o final do período pago.'
      },
      {
        question: 'Vocês oferecem reembolso?',
        answer: 'Sim, oferecemos reembolso total em até 7 dias após a compra, desde que você não tenha usado mais de 10% do conteúdo do curso.'
      },
      {
        question: 'Há algum teste gratuito?',
        answer: 'Atualmente não oferecemos teste gratuito, mas você pode ver demonstrações do conteúdo antes de comprar.'
      }
    ]
  },
  {
    id: 'security',
    title: 'Segurança',
    icon: ShieldCheckIcon,
    questions: [
      {
        question: 'Meus dados estão seguros?',
        answer: 'Sim! Utilizamos criptografia de ponta a ponta e seguimos as melhores práticas de segurança. Seus dados pessoais nunca são compartilhados com terceiros.'
      },
      {
        question: 'Como funciona a autenticação?',
        answer: 'Utilizamos Firebase Authentication, um sistema seguro da Google. Suas credenciais são protegidas com criptografia avançada.'
      },
      {
        question: 'Posso acessar de múltiplos dispositivos?',
        answer: 'Sim! Você pode acessar sua conta de qualquer dispositivo. Apenas certifique-se de fazer logout em dispositivos compartilhados.'
      },
      {
        question: 'Vocês seguem a LGPD?',
        answer: 'Sim, seguimos rigorosamente a Lei Geral de Proteção de Dados (LGPD). Você tem controle total sobre seus dados pessoais.'
      }
    ]
  },
  {
    id: 'community',
    title: 'Comunidade',
    icon: UserGroupIcon,
    questions: [
      {
        question: 'Posso interagir com outros estudantes?',
        answer: 'Sim! Através do Feed Social você pode comentar, curtir posts e compartilhar experiências com outros estudantes.'
      },
      {
        question: 'Como funciona o Feed Social?',
        answer: 'O admin publica dicas, novidades e conteúdo educativo. Você pode curtir, comentar e até compartilhar imagens nos comentários.'
      },
      {
        question: 'Posso fazer perguntas sobre o conteúdo?',
        answer: 'Sim! Você pode usar o Feed Social para fazer perguntas sobre o conteúdo. Outros estudantes e nossa equipe podem ajudar.'
      },
      {
        question: 'Há grupos de estudo?',
        answer: 'Atualmente não temos grupos formais, mas o Feed Social funciona como uma comunidade onde você pode conectar com outros estudantes.'
      }
    ]
  }
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('general');
  const [openQuestions, setOpenQuestions] = useState<Set<string>>(new Set());

  const toggleQuestion = (questionId: string) => {
    const newOpenQuestions = new Set(openQuestions);
    if (newOpenQuestions.has(questionId)) {
      newOpenQuestions.delete(questionId);
    } else {
      newOpenQuestions.add(questionId);
    }
    setOpenQuestions(newOpenQuestions);
  };

  const activeCategoryData = faqCategories.find(cat => cat.id === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link 
              href="/"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Voltar ao Início</span>
            </Link>
            
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">FAQ</h1>
            
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <QuestionMarkCircleIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Encontre respostas para as dúvidas mais comuns sobre a plataforma FlashConCards.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categorias</h3>
              <div className="space-y-2">
                {faqCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                      activeCategory === category.id
                        ? 'bg-blue-50 border border-blue-200 text-blue-900'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <category.icon className="w-5 h-5" />
                      <span className="font-medium">{category.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-8">
              {activeCategoryData && (
                <>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <activeCategoryData.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{activeCategoryData.title}</h3>
                      <p className="text-gray-600">Perguntas sobre {activeCategoryData.title.toLowerCase()}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {activeCategoryData.questions.map((item, index) => {
                      const questionId = `${activeCategoryData.id}-${index}`;
                      const isOpen = openQuestions.has(questionId);
                      
                      return (
                        <div key={questionId} className="border border-gray-200 rounded-lg">
                          <button
                            onClick={() => toggleQuestion(questionId)}
                            className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                          >
                            <span className="font-medium text-gray-900">{item.question}</span>
                            {isOpen ? (
                              <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                            ) : (
                              <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                            )}
                          </button>
                          
                          {isOpen && (
                            <div className="px-4 pb-4">
                              <div className="border-t border-gray-200 pt-4">
                                <p className="text-gray-700 whitespace-pre-line">{item.answer}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Não encontrou o que procurava?</h3>
            <p className="text-lg mb-6 opacity-90">
              Entre em contato conosco e teremos prazer em ajudar!
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Entrar em Contato
              <ArrowLeftIcon className="w-5 h-5 ml-2 rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 