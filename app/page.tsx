'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Target, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  Star,
  ArrowRight,
  Play,
  X
} from 'lucide-react'
import RealStats from './components/RealStats'
import RealTestimonials from './components/RealTestimonials'

export default function HomePage() {
  const [showDemo, setShowDemo] = useState(false)
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false)

  const features = [
    {
      icon: BookOpen,
      title: "Flashcards Inteligentes",
      description: "Sistema baseado em repetição espaçada para memorização eficiente"
    },
    {
      icon: Target,
      title: "Foco no Policial Legislativo",
      description: "Conteúdo específico para o cargo de Policial Legislativo da ALEGO"
    },
    {
      icon: TrendingUp,
      title: "Progresso em Tempo Real",
      description: "Acompanhe seu desenvolvimento com estatísticas detalhadas"
    },
    {
      icon: Users,
      title: "Metodologia Comprovada",
      description: "Baseado na ciência da memorização e repetição espaçada"
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="header-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-white" />
              <span className="ml-2 text-xl font-bold text-white">FlashConCards</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-white hover:text-gray-200 transition-colors">Recursos</a>
              <a href="#pricing" className="text-white hover:text-gray-200 transition-colors">Preços</a>
              <a href="/entrar" className="bg-white text-primary-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">Entrar</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="bg-red-500 text-white px-4 py-2 rounded-full inline-block mb-6">
                <span className="font-bold">PREPARATÓRIO ESPECÍFICO</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-white">
                Prepare-se para ser <span className="text-yellow-300">Policial Legislativo da ALEGO</span>
              </h1>
              <p className="text-xl mb-8 text-white/90">
                Domine todo o conteúdo específico do concurso para Policial Legislativo da Assembleia Legislativa de Goiás com nosso sistema de flashcards baseado em ciência da memorização. 
                Aprove-se com confiança!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="/payment" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-colors inline-flex items-center justify-center">
                  Quero ser Policial Legislativo da ALEGO!
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
                <button 
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-6 rounded-lg transition-colors"
                  onClick={() => setShowDemo(true)}
                >
                  <Play className="mr-2 h-5 w-5" />
                  Ver Demo
                </button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="container-glass p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">FlashConCard de Exemplo</h3>
                  <p className="text-gray-600 mb-4">Clique para ver a resposta</p>
                  <div 
                    className="bg-gray-50 rounded-lg p-6 min-h-[120px] flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => setShowFlashcardAnswer(!showFlashcardAnswer)}
                  >
                    {!showFlashcardAnswer ? (
                      <p className="text-gray-700 font-medium">
                        "Qual é a função principal do Policial Legislativo na ALEGO?"
                      </p>
                    ) : (
                      <div className="text-center">
                        <p className="text-gray-700 font-medium mb-2">Resposta:</p>
                        <p className="text-gray-600">
                          O Policial Legislativo da ALEGO tem como função principal garantir a segurança, 
                          ordem e funcionamento da Assembleia Legislativa de Goiás, incluindo a proteção 
                          de parlamentares, funcionários e visitantes, além de zelar pela integridade 
                          do patrimônio público.
                        </p>
                      </div>
                    )}
                  </div>
                  <button 
                    className="mt-4 text-sm text-primary-600 hover:text-primary-700 underline"
                    onClick={() => setShowFlashcardAnswer(!showFlashcardAnswer)}
                  >
                    {showFlashcardAnswer ? 'Ver pergunta' : 'Ver resposta'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Por que escolher FlashConCards para Policial Legislativo?
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Desenvolvido especificamente para o concurso de Policial Legislativo da ALEGO com base na ciência da memorização
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card text-center"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <RealStats />

      {/* Testimonials Section */}
      <RealTestimonials />

      {/* CTA Section */}
      <section id="pricing" className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-red-500 text-white px-6 py-3 rounded-full inline-block mb-6">
            <span className="font-bold">OFERTA ESPECIAL: 75% DE DESCONTO!</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-white">
            Comece sua jornada para ser Policial Legislativo hoje
          </h2>
          <div className="mb-8">
            <p className="text-xl text-white/90 mb-2">
              De <span className="line-through">R$ 399,90</span> por apenas
            </p>
            <p className="text-3xl font-bold text-yellow-300">
              R$ 99,90
            </p>
          </div>
          <div className="container-glass p-8 text-gray-900">
            <h3 className="text-2xl font-bold mb-4">O que está incluído:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-8">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span>500+ FlashConCards específicos para Policial Legislativo</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span>Desconto especial de 75% (de R$ 399,90 por R$ 99,90)</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span>Sistema de revisão espaçada</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span>Estatísticas de progresso</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span>Acesso por 12 meses</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span>Atualizações gratuitas</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span>Suporte especializado</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span>Conteúdo específico da ALEGO</span>
              </div>
            </div>
            <a href="/payment" className="bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xl py-4 px-8 rounded-lg transition-colors inline-flex items-center justify-center">
              Quero ser Policial Legislativo da ALEGO!
            </a>
            <p className="text-sm text-gray-500 mt-4">
              Pagamento seguro via PIX ou cartão de crédito
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-gradient text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <BookOpen className="h-8 w-8 text-white" />
                <span className="ml-2 text-xl font-bold">FlashConCards</span>
              </div>
              <p className="text-white/80">
                Prepare-se para o concurso de Policial Legislativo da ALEGO com o melhor sistema de FlashConCards do mercado.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-white/80">
                <li><a href="#" className="hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Central de Ajuda</h4>
              <ul className="space-y-2 text-white/80">
                <li><a href="/ajuda" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="/ajuda" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="/ajuda" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-white/80">
                <li><a href="/termos" className="hover:text-white transition-colors">Termos de Uso</a></li>
                <li><a href="/privacidade" className="hover:text-white transition-colors">Política de Privacidade</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/80">
            <p>&copy; 2024 FlashConCards. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      {showDemo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="container-glass max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Demo FlashConCards - Policial Legislativo</h3>
                <button 
                  onClick={() => setShowDemo(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Como funciona:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Clique nos cards para ver a pergunta</li>
                    <li>• Clique novamente para ver a resposta</li>
                    <li>• Marque se acertou ou errou</li>
                    <li>• Acompanhe seu progresso</li>
                  </ul>
                </div>
                <div className="text-center">
                  <a 
                    href="/study/portugues" 
                    className="btn-primary inline-flex items-center"
                    onClick={() => setShowDemo(false)}
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Experimentar Agora
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 