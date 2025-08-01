import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Link
              href="/"
              className="btn-outline flex items-center gap-2 mr-4"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Voltar
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Política de Privacidade</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Política de Privacidade</h2>
            
            <p className="text-gray-600 mb-6">
              <strong>Última atualização:</strong> Janeiro de 2025
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Informações que Coletamos</h3>
            <p className="text-gray-600 mb-4">
              Coletamos informações que você nos fornece diretamente, como quando cria uma conta, 
              faz uma compra ou entra em contato conosco. Isso pode incluir:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-6">
              <li>Nome e informações de contato</li>
              <li>Informações de pagamento</li>
              <li>Dados de uso da plataforma</li>
              <li>Progresso de estudos</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Como Usamos Suas Informações</h3>
            <p className="text-gray-600 mb-4">
              Utilizamos suas informações para:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-6">
              <li>Fornecer e melhorar nossos serviços</li>
              <li>Personalizar sua experiência de estudo</li>
              <li>Processar pagamentos</li>
              <li>Enviar comunicações importantes</li>
              <li>Analisar o uso da plataforma</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Compartilhamento de Informações</h3>
            <p className="text-gray-600 mb-6">
              Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, 
              exceto conforme descrito nesta política ou com seu consentimento explícito.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">4. Segurança dos Dados</h3>
            <p className="text-gray-600 mb-6">
              Implementamos medidas de segurança técnicas e organizacionais apropriadas para 
              proteger suas informações pessoais contra acesso não autorizado, alteração, 
              divulgação ou destruição.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">5. Seus Direitos</h3>
            <p className="text-gray-600 mb-4">
              Você tem o direito de:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-6">
              <li>Acessar suas informações pessoais</li>
              <li>Corrigir dados imprecisos</li>
              <li>Solicitar a exclusão de seus dados</li>
              <li>Retirar consentimento a qualquer momento</li>
              <li>Portabilidade de dados</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">6. Cookies e Tecnologias Similares</h3>
            <p className="text-gray-600 mb-6">
              Utilizamos cookies e tecnologias similares para melhorar sua experiência, 
              analisar o uso da plataforma e personalizar conteúdo.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">7. Retenção de Dados</h3>
            <p className="text-gray-600 mb-6">
              Mantemos suas informações pessoais apenas pelo tempo necessário para cumprir 
              as finalidades descritas nesta política, a menos que a retenção seja exigida 
              ou permitida por lei.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">8. Transferências Internacionais</h3>
            <p className="text-gray-600 mb-6">
              Suas informações podem ser transferidas e processadas em países diferentes 
              do seu país de residência. Garantimos que essas transferências sejam feitas 
              em conformidade com as leis aplicáveis.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">9. Menores de Idade</h3>
            <p className="text-gray-600 mb-6">
              Nossos serviços não são destinados a menores de 13 anos. Não coletamos 
              intencionalmente informações pessoais de menores de 13 anos.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">10. Alterações nesta Política</h3>
            <p className="text-gray-600 mb-6">
              Podemos atualizar esta política periodicamente. Notificaremos você sobre 
              mudanças significativas por e-mail ou através de um aviso em nossa plataforma.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">11. Contato</h3>
            <p className="text-gray-600 mb-6">
              Se você tiver dúvidas sobre esta política de privacidade, entre em contato conosco:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600">
                <strong>E-mail:</strong> flashconcards@gmail.com<br />
                <strong>Telefone:</strong> (62) 98184-1878<br />
                                  <strong>Atendimento:</strong> 100% online
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 