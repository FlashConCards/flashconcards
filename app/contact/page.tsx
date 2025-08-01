import { ArrowLeftIcon, EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function ContactPage() {
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
            <h1 className="text-3xl font-bold text-gray-900">Contato</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Entre em Contato</h2>
            <p className="text-gray-600">
              Estamos aqui para ajudar! Entre em contato conosco através dos canais abaixo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Informações de Contato */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Informações de Contato</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <EnvelopeIcon className="w-6 h-6 text-primary-600 mr-4 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">E-mail</h4>
                    <p className="text-gray-600">contato@flashconcards.com</p>
                    <p className="text-gray-600">flashconcards@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <PhoneIcon className="w-6 h-6 text-primary-600 mr-4 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Telefone</h4>
                    <p className="text-gray-600">(62) 98184-1878</p>
                    <p className="text-gray-600">Segunda a Sexta: 9h às 18h</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPinIcon className="w-6 h-6 text-primary-600 mr-4 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Atendimento</h4>
                    <p className="text-gray-600">
                      Atendimento 100% online<br />
                      Suporte via WhatsApp e Email<br />
                      Resposta em até 24h
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulário de Contato */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Envie uma Mensagem</h3>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Seu nome completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assunto
                  </label>
                  <select className="input-field">
                    <option value="">Selecione um assunto</option>
                    <option value="suporte">Suporte Técnico</option>
                    <option value="pagamento">Dúvidas sobre Pagamento</option>
                    <option value="conteudo">Dúvidas sobre Conteúdo</option>
                    <option value="sugestao">Sugestões</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensagem
                  </label>
                  <textarea
                    rows={4}
                    className="input-field"
                    placeholder="Descreva sua dúvida ou solicitação..."
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full"
                >
                  Enviar Mensagem
                </button>
              </form>
            </div>
          </div>

          {/* FAQ Rápido */}
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Perguntas Frequentes</h3>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Como funciona o sistema de flashcards?
                </h4>
                <p className="text-gray-600">
                  Nosso sistema usa repetição espaçada para mostrar os cards no momento ideal 
                  para fixação do conteúdo, baseado no seu desempenho.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Posso cancelar minha assinatura?
                </h4>
                <p className="text-gray-600">
                  Sim, você pode cancelar a qualquer momento através das configurações da sua conta. 
                  O acesso permanecerá ativo até o final do período pago.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Vocês oferecem reembolso?
                </h4>
                <p className="text-gray-600">
                  Sim, oferecemos reembolso total em até 7 dias após a compra, desde que você 
                  não tenha usado mais de 10% do conteúdo do curso.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 