'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Target, 
  TrendingUp, 
  BarChart3, 
  Clock, 
  CheckCircle,
  Star,
  Zap,
  Users,
  Award,
  ArrowRight,
  X
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-white mr-3" />
              <h1 className="text-2xl font-bold text-white">FlashConCards</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/demo" 
                className="text-white hover:text-blue-200 transition-colors"
              >
                Demo
              </Link>
              <Link 
                href="/login" 
                className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                Entrar
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Super Discount */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-2xl p-8 mb-8 shadow-2xl"
          >
            <div className="flex items-center justify-center mb-4">
              <Zap className="h-8 w-8 mr-2" />
              <span className="text-2xl font-bold">SUPER DESCONTO</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-4">
              DE R$ 399,90
            </h1>
            <h2 className="text-6xl md:text-8xl font-bold text-yellow-300 mb-4">
              POR R$ 99,90
            </h2>
            <p className="text-xl mb-6">
              Economia de <span className="font-bold text-yellow-300">R$ 300,00</span> - 75% de desconto!
            </p>
            <div className="bg-white/20 rounded-lg p-4 mb-6">
              <p className="text-lg font-semibold">⏰ OFERTA POR TEMPO LIMITADO ⏰</p>
              <p className="text-sm">Não perca essa oportunidade única!</p>
            </div>
            <Link 
              href="/payment"
              className="bg-yellow-400 text-black px-8 py-4 rounded-xl text-xl font-bold hover:bg-yellow-300 transition-colors inline-flex items-center"
            >
              GARANTIR MINHA VAGA
              <ArrowRight className="ml-2 h-6 w-6" />
            </Link>
          </motion.div>

          <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Prepare-se para o Concurso da ALEGO
          </h3>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            O método mais eficiente para estudar e passar no concurso da Assembleia Legislativa de Goiás. 
            Flashcards inteligentes que se adaptam ao seu ritmo de aprendizado.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
            <BookOpen className="h-12 w-12 text-blue-300 mb-4" />
            <h3 className="text-xl font-bold mb-2">500+ Flashcards</h3>
            <p className="text-blue-100">Conteúdo completo das principais matérias do edital</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
            <Target className="h-12 w-12 text-green-300 mb-4" />
            <h3 className="text-xl font-bold mb-2">Método Científico</h3>
            <p className="text-blue-100">Baseado em técnicas comprovadas de memorização</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
            <TrendingUp className="h-12 w-12 text-purple-300 mb-4" />
            <h3 className="text-xl font-bold mb-2">Progresso Inteligente</h3>
            <p className="text-blue-100">Sistema que adapta-se ao seu ritmo de estudo</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
            <BarChart3 className="h-12 w-12 text-orange-300 mb-4" />
            <h3 className="text-xl font-bold mb-2">Estatísticas Detalhadas</h3>
            <p className="text-blue-100">Acompanhe seu progresso em tempo real</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
            <Clock className="h-12 w-12 text-red-300 mb-4" />
            <h3 className="text-xl font-bold mb-2">Estude Quando Quiser</h3>
            <p className="text-blue-100">Acesso 24/7 de qualquer dispositivo</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
            <CheckCircle className="h-12 w-12 text-yellow-300 mb-4" />
            <h3 className="text-xl font-bold mb-2">Garantia de Aprovação</h3>
            <p className="text-blue-100">Método testado e aprovado por milhares</p>
          </div>
        </motion.div>

        {/* Subjects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <h3 className="text-3xl font-bold text-white text-center mb-8">
            Matérias Incluídas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
              <h4 className="text-lg font-bold mb-2">Língua Portuguesa</h4>
              <p className="text-blue-100">Compreensão, interpretação e gramática</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
              <h4 className="text-lg font-bold mb-2">Noções de Informática</h4>
              <p className="text-blue-100">Sistemas operacionais e pacote Office</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
              <h4 className="text-lg font-bold mb-2">Direito Constitucional</h4>
              <p className="text-blue-100">Constituição e direitos fundamentais</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
              <h4 className="text-lg font-bold mb-2">Direito Administrativo</h4>
              <p className="text-blue-100">Administração pública e atos administrativos</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
              <h4 className="text-lg font-bold mb-2">Realidade de Goiás</h4>
              <p className="text-blue-100">História, cultura e geografia do estado</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
              <h4 className="text-lg font-bold mb-2">Legislação ALEGO</h4>
              <p className="text-blue-100">Regimento interno e estrutura legislativa</p>
            </div>
          </div>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-12"
        >
          <h3 className="text-3xl font-bold text-white text-center mb-8">
            O que nossos alunos dizem
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-300 fill-current" />
                ))}
              </div>
              <p className="text-blue-100 mb-4">
                "Consegui passar no concurso graças aos flashcards! Método incrível!"
              </p>
              <p className="font-semibold">- Maria Silva</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-300 fill-current" />
                ))}
              </div>
              <p className="text-blue-100 mb-4">
                "Estudar nunca foi tão fácil e eficiente. Recomendo para todos!"
              </p>
              <p className="font-semibold">- João Santos</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-300 fill-current" />
                ))}
              </div>
              <p className="text-blue-100 mb-4">
                "O progresso inteligente me ajudou a focar no que realmente importa."
              </p>
              <p className="font-semibold">- Ana Costa</p>
            </div>
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-2xl p-8 shadow-2xl">
            <h2 className="text-4xl font-bold mb-4">
              NÃO PERCA ESSA OPORTUNIDADE!
            </h2>
            <p className="text-xl mb-6">
              De <span className="line-through">R$ 399,90</span> por apenas <span className="text-yellow-300 font-bold text-2xl">R$ 99,90</span>
            </p>
            <p className="text-lg mb-8">
              Economia de R$ 300,00 - 75% de desconto por tempo limitado!
            </p>
            <Link 
              href="/payment"
              className="bg-yellow-400 text-black px-8 py-4 rounded-xl text-xl font-bold hover:bg-yellow-300 transition-colors inline-flex items-center"
            >
              GARANTIR MINHA VAGA AGORA
              <ArrowRight className="ml-2 h-6 w-6" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-white/10 backdrop-blur-sm border-t border-white/20 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white">
            <p>&copy; 2024 FlashConCards. Todos os direitos reservados.</p>
            <div className="mt-4 space-x-4">
              <Link href="/termos" className="text-blue-200 hover:text-white">
                Termos de Uso
              </Link>
              <Link href="/privacidade" className="text-blue-200 hover:text-white">
                Política de Privacidade
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 