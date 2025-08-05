'use client';

import { useState } from 'react';
import { 
  ArrowLeftIcon, 
  BookOpenIcon, 
  CpuChipIcon, 
  ChartBarIcon,
  ClockIcon,
  AcademicCapIcon,
  UserGroupIcon,
  LightBulbIcon,
  PlayIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

const tutorialSteps = [
  {
    id: 1,
    title: 'Entenda o Método',
    description: 'Como funciona a repetição espaçada e por que é tão eficaz',
    icon: CpuChipIcon,
    content: `
      <h3 className="text-xl font-semibold mb-4">A Ciência por Trás dos Flashcards</h3>
      <p className="mb-4">A repetição espaçada é baseada na <strong>Curva do Esquecimento</strong> de Ebbinghaus, que mostra como nossa memória funciona:</p>
      <ul className="list-disc list-inside space-y-2 mb-4">
        <li>Esquecemos 50% do que aprendemos em 24 horas</li>
        <li>Após 7 dias, retemos apenas 20%</li>
        <li>Repetição no momento certo fortalece a memória</li>
      </ul>
      <p>Nosso algoritmo calcula o momento ideal para revisar cada card, maximizando sua retenção de conhecimento.</p>
    `
  },
  {
    id: 2,
    title: 'Primeiros Passos',
    description: 'Como começar a estudar com FlashConCards',
    icon: PlayIcon,
    content: `
      <h3 className="text-xl font-semibold mb-4">Começando Seus Estudos</h3>
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">1. Escolha seu Curso</h4>
          <p className="text-blue-800">Selecione o curso que deseja estudar na área de estudos.</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-900 mb-2">2. Selecione uma Matéria</h4>
          <p className="text-green-800">Escolha a matéria específica que quer revisar.</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-semibold text-purple-900 mb-2">3. Escolha um Tópico</h4>
          <p className="text-purple-800">Selecione o tópico e clique em "Estudar".</p>
        </div>
      </div>
    `
  },
  {
    id: 3,
    title: 'Como Estudar',
    description: 'Técnicas para maximizar seu aprendizado',
    icon: AcademicCapIcon,
    content: `
      <h3 className="text-xl font-semibold mb-4">Técnicas de Estudo Eficazes</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-semibold text-yellow-900 mb-2">📖 Leia com Atenção</h4>
          <p className="text-yellow-800">Leia a pergunta cuidadosamente antes de responder.</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">🤔 Pense Antes</h4>
          <p className="text-blue-800">Tente responder mentalmente antes de virar o card.</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-900 mb-2">✅ Seja Honesto</h4>
          <p className="text-green-800">Marque "Conheço" apenas se realmente souber a resposta.</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-semibold text-purple-900 mb-2">🔄 Revise Regularmente</h4>
          <p className="text-purple-800">Estude um pouco todos os dias para melhores resultados.</p>
        </div>
      </div>
    `
  },
  {
    id: 4,
    title: 'Aprofundamentos',
    description: 'Como usar os conteúdos extras para estudo completo',
    icon: LightBulbIcon,
    content: `
      <h3 className="text-xl font-semibold mb-4">Aprofundando seu Conhecimento</h3>
      <p className="mb-4">Os aprofundamentos são conteúdos extras que complementam os flashcards:</p>
      <div className="space-y-3">
        <div className="flex items-start space-x-3">
          <CheckCircleIcon className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-semibold">Explicações Detalhadas</h4>
            <p className="text-sm text-gray-600">Conceitos explicados de forma clara e didática</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <CheckCircleIcon className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-semibold">Exemplos Práticos</h4>
            <p className="text-sm text-gray-600">Casos reais para fixar o aprendizado</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <CheckCircleIcon className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-semibold">Dicas de Estudo</h4>
            <p className="text-sm text-gray-600">Técnicas específicas para cada tópico</p>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 5,
    title: 'Acompanhe seu Progresso',
    description: 'Como usar as estatísticas para melhorar seus estudos',
    icon: ChartBarIcon,
    content: `
      <h3 className="text-xl font-semibold mb-4">Monitorando seu Desenvolvimento</h3>
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg">
          <h4 className="font-semibold mb-2">📊 Estatísticas Detalhadas</h4>
          <ul className="text-sm space-y-1">
            <li>• Cards estudados vs. total</li>
            <li>• Taxa de acerto por matéria</li>
            <li>• Tempo de estudo diário</li>
            <li>• Progresso por tópico</li>
          </ul>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">🎯 Metas e Objetivos</h4>
          <p className="text-sm text-gray-600">Defina metas diárias e acompanhe seu progresso para manter a motivação.</p>
        </div>
      </div>
    `
  },
  {
    id: 6,
    title: 'Feed Social',
    description: 'Como interagir com outros estudantes',
    icon: UserGroupIcon,
    content: `
      <h3 className="text-xl font-semibold mb-4">Conectando com a Comunidade</h3>
      <div className="space-y-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-900 mb-2">💬 Comentários e Dúvidas</h4>
          <p className="text-green-800">Compartilhe suas dúvidas e ajude outros estudantes.</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">👍 Interações</h4>
          <p className="text-blue-800">Curta e comente posts do admin com dicas e novidades.</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-semibold text-purple-900 mb-2">📸 Compartilhamento</h4>
          <p className="text-purple-800">Compartilhe imagens e screenshots de seus progressos.</p>
        </div>
      </div>
    `
  }
];

export default function TutorialPage() {
  const [activeStep, setActiveStep] = useState(1);

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
            
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Tutorial</h1>
            
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpenIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Como Estudar com FlashConCards
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Aprenda a usar nossa plataforma de forma eficaz e maximize seus resultados nos estudos.
          </p>
        </div>

        {/* Tutorial Steps */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Passos do Tutorial</h3>
              <div className="space-y-2">
                {tutorialSteps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                      activeStep === step.id
                        ? 'bg-blue-50 border border-blue-200 text-blue-900'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activeStep === step.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        <step.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium">{step.title}</div>
                        <div className="text-sm text-gray-500">{step.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-8">
              {tutorialSteps.map((step) => (
                <div
                  key={step.id}
                  className={activeStep === step.id ? 'block' : 'hidden'}
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                  
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: step.content }}
                  />
                </div>
              ))}

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
                  disabled={activeStep === 1}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                
                <div className="flex space-x-2">
                  {tutorialSteps.map((step) => (
                    <button
                      key={step.id}
                      onClick={() => setActiveStep(step.id)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        activeStep === step.id ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                
                <button
                  onClick={() => setActiveStep(Math.min(tutorialSteps.length, activeStep + 1))}
                  disabled={activeStep === tutorialSteps.length}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próximo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Pronto para Começar?</h3>
            <p className="text-lg mb-6 opacity-90">
              Agora que você conhece a plataforma, está pronto para maximizar seus estudos!
            </p>
            <Link
              href="/course-selection"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Começar a Estudar
              <ArrowLeftIcon className="w-5 h-5 ml-2 rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 