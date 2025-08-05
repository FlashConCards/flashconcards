'use client';

import { useState } from 'react';
import { ArrowLeftIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function ContactPage() {
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText('suporte@flashconcards.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent('Olá! Preciso de ajuda com o FlashConCards.');
    const whatsappUrl = `https://wa.me/5511999999999?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

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
            
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Contato</h1>
            
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Entre em Contato
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Estamos aqui para ajudar! Entre em contato conosco através dos canais abaixo.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Email */}
          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <EnvelopeIcon className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">E-mail</h3>
            <p className="text-gray-600 mb-4">
              Envie suas dúvidas e sugestões
            </p>
            
            <div className="space-y-3">
              <p className="text-lg font-medium text-gray-900">
                suporte@flashconcards.com
              </p>
              
              <button
                onClick={copyEmail}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {copied ? 'Copiado!' : 'Copiar E-mail'}
              </button>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <PhoneIcon className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">WhatsApp</h3>
            <p className="text-gray-600 mb-4">
              Conversa direta e rápida
            </p>
            
            <button
              onClick={openWhatsApp}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Abrir WhatsApp
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
            Horário de Atendimento
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6 text-center">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Segunda a Sexta</h4>
              <p className="text-gray-600">8h às 18h</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Sábado</h4>
              <p className="text-gray-600">9h às 14h</p>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Resposta em até 24 horas em dias úteis
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 