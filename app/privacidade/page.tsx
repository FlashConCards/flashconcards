'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Shield } from 'lucide-react'
import Link from 'next/link'

export default function PrivacidadePage() {
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
              <Shield className="h-6 w-6 text-primary-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">Política de Privacidade</span>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Política de Privacidade</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Informações Coletadas</h2>
              <p className="text-gray-600 mb-4">
                Coletamos as seguintes informações para fornecer nossos serviços:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li><strong>Informações de identificação:</strong> nome, email, telefone</li>
                <li><strong>Dados de pagamento:</strong> informações necessárias para processar pagamentos</li>
                <li><strong>Dados de uso:</strong> progresso de estudo, cards visualizados, tempo de estudo</li>
                <li><strong>Dados técnicos:</strong> tipo de dispositivo, navegador, endereço IP</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Como Usamos Suas Informações</h2>
              <p className="text-gray-600 mb-4">
                Utilizamos suas informações para:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Fornecer acesso ao sistema FlashConCards</li>
                <li>Personalizar sua experiência de estudo</li>
                <li>Processar pagamentos e emitir faturas</li>
                <li>Enviar comunicações sobre o serviço</li>
                <li>Melhorar nossos produtos e serviços</li>
                <li>Cumprir obrigações legais</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Compartilhamento de Informações</h2>
              <p className="text-gray-600 mb-4">
                Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Com processadores de pagamento para finalizar transações</li>
                <li>Com provedores de serviços que nos ajudam a operar a plataforma</li>
                <li>Quando exigido por lei ou ordem judicial</li>
                <li>Para proteger nossos direitos e segurança</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Segurança dos Dados</h2>
              <p className="text-gray-600 mb-4">
                Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Criptografia de dados em trânsito e em repouso</li>
                <li>Controles de acesso rigorosos</li>
                <li>Monitoramento contínuo de segurança</li>
                <li>Backups regulares dos dados</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Seus Direitos</h2>
              <p className="text-gray-600 mb-4">
                Você tem os seguintes direitos sobre suas informações pessoais:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li><strong>Acesso:</strong> Solicitar cópia dos dados que temos sobre você</li>
                <li><strong>Correção:</strong> Solicitar correção de dados incorretos</li>
                <li><strong>Exclusão:</strong> Solicitar exclusão de seus dados</li>
                <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
                <li><strong>Oposição:</strong> Opor-se ao processamento de seus dados</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cookies e Tecnologias Similares</h2>
              <p className="text-gray-600 mb-4">
                Utilizamos cookies e tecnologias similares para:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Manter sua sessão ativa</li>
                <li>Lembrar suas preferências</li>
                <li>Analisar o uso da plataforma</li>
                <li>Melhorar a experiência do usuário</li>
              </ul>
              <p className="text-gray-600 mb-4">
                Você pode controlar o uso de cookies através das configurações do seu navegador.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Retenção de Dados</h2>
              <p className="text-gray-600 mb-4">
                Mantemos suas informações pelo tempo necessário para:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Fornecer nossos serviços</li>
                <li>Cumprir obrigações legais</li>
                <li>Resolver disputas</li>
                <li>Fazer cumprir nossos acordos</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Menores de Idade</h2>
              <p className="text-gray-600 mb-4">
                Nosso serviço não é destinado a menores de 18 anos. Não coletamos intencionalmente 
                informações pessoais de menores de idade. Se você é pai ou responsável e acredita que 
                seu filho nos forneceu informações pessoais, entre em contato conosco.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Alterações na Política</h2>
              <p className="text-gray-600 mb-4">
                Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças 
                significativas através do email ou através de um aviso em nossa plataforma.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contato</h2>
              <p className="text-gray-600 mb-4">
                Para dúvidas sobre esta política ou para exercer seus direitos, entre em contato:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Email: flashconcards@gmail.com</li>
                <li>WhatsApp: (62) 98184-1877</li>
                <li>Endereço: Goiás, Brasil</li>
              </ul>
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  )
} 