import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function TermsPage() {
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
            <h1 className="text-3xl font-bold text-gray-900">Termos de Uso</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Termos de Uso</h2>
            
            <p className="text-gray-600 mb-6">
              <strong>Última atualização:</strong> Janeiro de 2025
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Aceitação dos Termos</h3>
            <p className="text-gray-600 mb-6">
              Ao acessar e usar a plataforma FlashConCards, você concorda em cumprir e estar 
              vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, 
              não deve usar nossos serviços.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Descrição do Serviço</h3>
            <p className="text-gray-600 mb-6">
              O FlashConCards é uma plataforma de estudos que oferece flashcards inteligentes, 
              sistema de repetição espaçada e conteúdo educacional para preparação de concursos públicos.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Criação de Conta</h3>
            <p className="text-gray-600 mb-4">
              Para usar nossos serviços, você deve:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-6">
              <li>Ter pelo menos 13 anos de idade</li>
              <li>Fornecer informações precisas e completas</li>
              <li>Manter a segurança de sua conta</li>
              <li>Ser responsável por todas as atividades em sua conta</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">4. Uso Aceitável</h3>
            <p className="text-gray-600 mb-4">
              Você concorda em usar a plataforma apenas para fins legais e educacionais. É proibido:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-6">
              <li>Usar a plataforma para atividades ilegais</li>
              <li>Tentar acessar contas de outros usuários</li>
              <li>Interferir no funcionamento da plataforma</li>
              <li>Compartilhar conteúdo ofensivo ou inadequado</li>
              <li>Usar bots ou scripts automatizados</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">5. Propriedade Intelectual</h3>
            <p className="text-gray-600 mb-6">
              Todo o conteúdo da plataforma, incluindo textos, imagens, vídeos e software, 
              é protegido por direitos autorais e outras leis de propriedade intelectual. 
              Você não pode copiar, distribuir ou modificar este conteúdo sem autorização.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">6. Pagamentos e Reembolsos</h3>
            <p className="text-gray-600 mb-4">
              <strong>Pagamentos:</strong> Os preços são cobrados antecipadamente e não são reembolsáveis, 
              exceto conforme nossa política de reembolso.
            </p>
            <p className="text-gray-600 mb-4">
              <strong>Reembolsos:</strong> Oferecemos reembolso total em até 7 dias após a compra, 
              desde que você não tenha usado mais de 10% do conteúdo do curso.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">7. Limitação de Responsabilidade</h3>
            <p className="text-gray-600 mb-6">
              O FlashConCards não garante que você será aprovado em concursos. Os resultados 
              dependem do seu esforço e dedicação. Não nos responsabilizamos por danos indiretos, 
              incidentais ou consequenciais.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">8. Privacidade</h3>
            <p className="text-gray-600 mb-6">
              O uso de suas informações pessoais é regido por nossa Política de Privacidade, 
              que faz parte destes Termos de Uso.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">9. Modificações do Serviço</h3>
            <p className="text-gray-600 mb-6">
              Reservamo-nos o direito de modificar, suspender ou descontinuar qualquer parte 
              da plataforma a qualquer momento, com ou sem aviso prévio.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">10. Rescisão</h3>
            <p className="text-gray-600 mb-6">
              Podemos encerrar ou suspender sua conta a qualquer momento, por qualquer motivo, 
              incluindo violação destes termos. Você pode cancelar sua conta a qualquer momento 
              através das configurações da plataforma.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">11. Lei Aplicável</h3>
            <p className="text-gray-600 mb-6">
              Estes termos são regidos pelas leis brasileiras. Qualquer disputa será resolvida 
              nos tribunais da cidade de São Paulo, SP.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">12. Disposições Gerais</h3>
            <p className="text-gray-600 mb-4">
              <strong>Independência:</strong> Se qualquer disposição destes termos for considerada 
              inválida, as demais disposições permanecerão em vigor.
            </p>
            <p className="text-gray-600 mb-4">
              <strong>Acordo Completo:</strong> Estes termos constituem o acordo completo entre 
              você e o FlashConCards.
            </p>
            <p className="text-gray-600 mb-6">
              <strong>Renúncia:</strong> A falha em fazer valer qualquer direito não constitui 
              renúncia a esse direito.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">13. Contato</h3>
            <p className="text-gray-600 mb-6">
              Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600">
                <strong>E-mail:</strong> termos@flashconcards.com<br />
                <strong>Telefone:</strong> (11) 99999-9999<br />
                <strong>Endereço:</strong> Rua das Flores, 123 - São Paulo, SP
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 