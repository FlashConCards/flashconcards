'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, FileText } from 'lucide-react'
import Link from 'next/link'

export default function TermosPage() {
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
              <FileText className="h-6 w-6 text-primary-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">Termos de Uso</span>
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
          className="bg-white rounded-xl p-8 shadow-sm border border-gray-200"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Termos de Uso</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Aceitação dos Termos</h2>
              <p className="text-gray-600 mb-4">
                Ao acessar e usar o FlashConCards, você concorda em cumprir e estar vinculado a estes Termos de Uso. 
                Se você não concordar com qualquer parte destes termos, não deve usar nosso serviço.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Descrição do Serviço</h2>
              <p className="text-gray-600 mb-4">
                O FlashConCards é uma plataforma de estudo que oferece flashcards digitais para preparação 
                de concursos públicos, especificamente focado no concurso da ALEGO. O serviço inclui:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Acesso a flashcards organizados por matéria</li>
                <li>Sistema de revisão espaçada</li>
                <li>Estatísticas de progresso</li>
                <li>Atualizações de conteúdo</li>
                <li>Suporte técnico</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Acesso e Uso</h2>
              <p className="text-gray-600 mb-4">
                O acesso ao FlashConCards é concedido por 12 meses a partir da data da compra. 
                Durante este período, você pode:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Acessar o conteúdo em múltiplos dispositivos</li>
                <li>Usar o sistema para estudo pessoal</li>
                <li>Receber atualizações automáticas</li>
              </ul>
              <p className="text-gray-600 mb-4">
                É proibido:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Compartilhar suas credenciais de acesso</li>
                <li>Reproduzir ou distribuir o conteúdo</li>
                <li>Usar o sistema para fins comerciais</li>
                <li>Tentar acessar áreas restritas do sistema</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Pagamento e Reembolso</h2>
              <p className="text-gray-600 mb-4">
                O pagamento é realizado no momento da compra. Oferecemos reembolso total em até 7 dias 
                após a compra, caso você não esteja satisfeito com o serviço.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Privacidade</h2>
              <p className="text-gray-600 mb-4">
                Suas informações pessoais são tratadas de acordo com nossa Política de Privacidade. 
                Coletamos apenas dados necessários para fornecer o serviço e melhorar sua experiência.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Limitação de Responsabilidade</h2>
              <p className="text-gray-600 mb-4">
                O FlashConCards é fornecido "como está". Não garantimos que o uso do serviço resultará 
                em aprovação no concurso. Nosso compromisso é fornecer material de qualidade para estudo.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Modificações</h2>
              <p className="text-gray-600 mb-4">
                Reservamo-nos o direito de modificar estes termos a qualquer momento. 
                As modificações entrarão em vigor imediatamente após sua publicação.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Contato</h2>
              <p className="text-gray-600 mb-4">
                Para dúvidas sobre estes termos, entre em contato conosco:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Email: flashconcards@gmail.com</li>
                <li>WhatsApp: (62) 98184-1877</li>
              </ul>
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  )
} 