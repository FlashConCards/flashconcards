'use client';

import { useState } from 'react';
import { 
  ArrowLeftIcon, 
  ShieldCheckIcon,
  LockClosedIcon,
  EyeIcon,
  DocumentTextIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

const privacySections = [
  {
    id: 'data-collection',
    title: 'Coleta de Dados',
    icon: DocumentTextIcon,
    content: `
      <h3 className="text-xl font-semibold mb-4">Quais dados coletamos?</h3>
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Dados Pessoais</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Nome completo</li>
            <li>• Endereço de e-mail</li>
            <li>• Data de nascimento (opcional)</li>
          </ul>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-900 mb-2">Dados de Uso</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Progresso de estudo</li>
            <li>• Tempo de sessão</li>
            <li>• Preferências de conteúdo</li>
            <li>• Interações com flashcards</li>
          </ul>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-semibold text-purple-900 mb-2">Dados Técnicos</h4>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• Endereço IP</li>
            <li>• Tipo de dispositivo</li>
            <li>• Navegador utilizado</li>
            <li>• Sistema operacional</li>
          </ul>
        </div>
      </div>
    `
  },
  {
    id: 'data-use',
    title: 'Uso dos Dados',
    icon: EyeIcon,
    content: `
      <h3 className="text-xl font-semibold mb-4">Como utilizamos seus dados?</h3>
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-900 mb-2">🎯 Personalização</h4>
            <p className="text-sm text-yellow-800">Adaptamos o conteúdo e dificuldade dos flashcards baseado no seu progresso.</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">📊 Análise</h4>
            <p className="text-sm text-blue-800">Analisamos padrões de uso para melhorar nossa plataforma.</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">💬 Comunicação</h4>
            <p className="text-sm text-green-800">Enviamos atualizações importantes e dicas de estudo.</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-2">🔧 Suporte</h4>
            <p className="text-sm text-purple-800">Utilizamos para resolver problemas técnicos e oferecer suporte.</p>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 'data-protection',
    title: 'Proteção de Dados',
    icon: LockClosedIcon,
    content: `
      <h3 className="text-xl font-semibold mb-4">Como protegemos seus dados?</h3>
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
          <h4 className="font-semibold mb-3">🔐 Criptografia Avançada</h4>
          <ul className="text-sm space-y-2">
            <li>• Todos os dados são criptografados em trânsito (HTTPS/TLS)</li>
            <li>• Dados armazenados são criptografados em repouso</li>
            <li>• Senhas são hasheadas com algoritmos seguros</li>
          </ul>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">🏢 Infraestrutura Segura</h4>
            <p className="text-sm text-gray-700">Utilizamos Firebase (Google) com certificações de segurança internacionais.</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">👥 Acesso Restrito</h4>
            <p className="text-sm text-gray-700">Apenas funcionários autorizados têm acesso aos dados pessoais.</p>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 'cookies',
    title: 'Política de Cookies',
    icon: ShieldCheckIcon,
    content: `
      <h3 className="text-xl font-semibold mb-4">Como usamos cookies?</h3>
      <div className="space-y-4">
        <div className="bg-orange-50 p-4 rounded-lg">
          <h4 className="font-semibold text-orange-900 mb-2">🍪 Cookies Essenciais</h4>
          <p className="text-sm text-orange-800 mb-2">Necessários para o funcionamento básico da plataforma:</p>
          <ul className="text-sm text-orange-800 space-y-1">
            <li>• Autenticação de usuário</li>
            <li>• Preferências de sessão</li>
            <li>• Segurança da aplicação</li>
          </ul>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">📈 Cookies de Análise</h4>
          <p className="text-sm text-blue-800 mb-2">Nos ajudam a entender como você usa a plataforma:</p>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Páginas mais visitadas</li>
            <li>• Tempo de permanência</li>
            <li>• Funcionalidades utilizadas</li>
          </ul>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-900 mb-2">🎯 Cookies de Personalização</h4>
          <p className="text-sm text-green-800 mb-2">Melhoram sua experiência personalizada:</p>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Lembrar suas preferências</li>
            <li>• Adaptar o conteúdo</li>
            <li>• Sugerir materiais relevantes</li>
          </ul>
        </div>
      </div>
    `
  },
  {
    id: 'lgpd',
    title: 'Conformidade LGPD',
    icon: CheckCircleIcon,
    content: `
      <h3 className="text-xl font-semibold mb-4">Direitos do Usuário (LGPD)</h3>
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-semibold text-red-900 mb-2">👁️ Acesso</h4>
            <p className="text-sm text-red-800">Solicitar acesso aos seus dados pessoais.</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">✏️ Correção</h4>
            <p className="text-sm text-blue-800">Corrigir dados incompletos ou incorretos.</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">🚫 Exclusão</h4>
            <p className="text-sm text-green-800">Solicitar a exclusão de seus dados.</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-2">⏸️ Portabilidade</h4>
            <p className="text-sm text-purple-800">Receber seus dados em formato estruturado.</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-6 rounded-lg">
          <h4 className="font-semibold mb-3">📞 Como Exercer Seus Direitos</h4>
          <p className="text-sm mb-3">Para exercer qualquer um desses direitos, entre em contato conosco:</p>
          <ul className="text-sm space-y-1">
            <li>• E-mail: privacidade@flashconcards.com</li>
            <li>• WhatsApp: (11) 99999-9999</li>
            <li>• Prazo de resposta: até 15 dias úteis</li>
          </ul>
        </div>
      </div>
    `
  }
];

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState('data-collection');

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
            
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Privacidade e Cookies</h1>
            
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheckIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Privacidade e Proteção de Dados
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Sua privacidade é fundamental para nós. Saiba como protegemos e utilizamos seus dados.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Seções</h3>
              <div className="space-y-2">
                {privacySections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                      activeSection === section.id
                        ? 'bg-blue-50 border border-blue-200 text-blue-900'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <section.icon className="w-5 h-5" />
                      <span className="font-medium">{section.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-8">
              {privacySections.map((section) => (
                <div
                  key={section.id}
                  className={activeSection === section.id ? 'block' : 'hidden'}
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <section.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{section.title}</h3>
                    </div>
                  </div>
                  
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Dúvidas sobre Privacidade?</h3>
            <p className="text-lg mb-6 opacity-90">
              Nossa equipe está pronta para esclarecer qualquer dúvida sobre proteção de dados.
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