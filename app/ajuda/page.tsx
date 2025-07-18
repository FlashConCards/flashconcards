'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Mail, Phone, MessageCircle, HelpCircle, FileText, Shield } from 'lucide-react'
import Link from 'next/link'

export default function AjudaPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center text-gray-900 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar ao Início
            </Link>
            <div className="flex items-center">
              <HelpCircle className="h-6 w-6 text-primary-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">Central de Ajuda</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Como podemos ajudar?
          </h1>
          <p className="text-xl text-gray-600">
            Estamos aqui para responder suas dúvidas e ajudar no seu sucesso
          </p>
        </motion.div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-xl p-8 shadow-sm border border-gray-200"
          >
            <div className="flex items-center mb-4">
              <Mail className="h-8 w-8 text-primary-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Email</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Envie suas dúvidas por email e receba resposta em até 24 horas
            </p>
            <a 
              href="mailto:flashconcards@gmail.com" 
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              flashconcards@gmail.com
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl p-8 shadow-sm border border-gray-200"
          >
            <div className="flex items-center mb-4">
              <MessageCircle className="h-8 w-8 text-green-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">WhatsApp</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Atendimento rápido via WhatsApp em horário comercial
            </p>
            <a 
              href="https://wa.me/55629818418778" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              (62) 98184-1877
            </a>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-xl p-8 shadow-sm border border-gray-200"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Perguntas Frequentes</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Como funciona o sistema de FlashConCards?
              </h3>
              <p className="text-gray-600">
                O sistema utiliza a técnica de repetição espaçada, apresentando os cards que você mais erra com maior frequência, otimizando seu aprendizado.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Por quanto tempo tenho acesso ao conteúdo?
              </h3>
              <p className="text-gray-600">
                Você tem acesso por 12 meses a partir da data da compra, incluindo todas as atualizações durante esse período.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Posso usar em diferentes dispositivos?
              </h3>
              <p className="text-gray-600">
                Sim! O sistema funciona em qualquer dispositivo com navegador web: computador, tablet ou celular.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Como faço para acessar minha conta?
              </h3>
              <p className="text-gray-600">
                Após a compra, você receberá um email com suas credenciais de acesso. Use o email cadastrado e a senha fornecida para fazer login.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                O conteúdo é atualizado?
              </h3>
              <p className="text-gray-600">
                Sim! O conteúdo é atualizado regularmente com base nos editais mais recentes e feedback dos usuários.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Additional Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Link 
            href="/termos"
            className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <FileText className="h-6 w-6 text-primary-600 mr-3" />
            <span className="text-gray-900 font-medium">Termos de Uso</span>
          </Link>
          
          <Link 
            href="/privacidade"
            className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <Shield className="h-6 w-6 text-primary-600 mr-3" />
            <span className="text-gray-900 font-medium">Política de Privacidade</span>
          </Link>
        </motion.div>
      </main>
    </div>
  )
} 