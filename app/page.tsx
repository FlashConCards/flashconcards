'use client'

import { motion } from 'framer-motion'
import { BookOpen, ArrowRight, CheckCircle, Star, Users, Target, Eye } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
      {/* Header */}
      <header className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-white"
        >
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-12 w-12 mr-3" />
            <h1 className="text-4xl font-bold">FlashConCards</h1>
          </div>
          <p className="text-xl mb-8">Prepare-se para o concurso de Policial Legislativo da ALEGO</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/demo"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
            >
              <Eye className="h-5 w-5 mr-2" />
              Ver Demo Gratuito
            </Link>
            <Link 
              href="/payment"
              className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center"
            >
              <ArrowRight className="h-5 w-5 mr-2" />
              Começar Agora
            </Link>
          </div>
        </motion.div>
      </header>

      {/* Features */}
      <section className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="bg-white rounded-xl p-6 shadow-2xl">
            <Target className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Questões Específicas</h3>
            <p className="text-gray-600">
              Flashcards organizados especificamente para o concurso de Policial Legislativo da ALEGO.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-2xl">
            <BookOpen className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">150+ Flashcards</h3>
            <p className="text-gray-600">
              Mais de 150 questões organizadas por matéria para maximizar seus estudos.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-2xl">
            <Users className="h-12 w-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Acesso Ilimitado</h3>
            <p className="text-gray-600">
              Estude quando e onde quiser, com acesso completo a todo o conteúdo.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-8 shadow-2xl"
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Por que escolher o FlashConCards?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">150+</div>
              <div className="text-gray-600">Flashcards</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">10+</div>
              <div className="text-gray-600">Matérias</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-gray-600">Disponível</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">100%</div>
              <div className="text-gray-600">Focado ALEGO</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-8 text-white text-center shadow-2xl"
        >
          <CheckCircle className="h-16 w-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Comece a estudar hoje mesmo!</h2>
          <p className="text-xl mb-8">
            Junte-se a centenas de candidatos que já estão se preparando com o FlashConCards
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/demo"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
            >
              <Eye className="h-5 w-5 mr-2" />
              Ver Demo Gratuito
            </Link>
            <Link 
              href="/payment"
              className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center"
            >
              <ArrowRight className="h-5 w-5 mr-2" />
              Fazer Cadastro
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-white"
        >
          <p className="mb-4">© 2024 FlashConCards. Todos os direitos reservados.</p>
          <div className="flex justify-center space-x-6">
            <Link href="/termos" className="hover:text-blue-200">Termos de Uso</Link>
            <Link href="/privacidade" className="hover:text-blue-200">Política de Privacidade</Link>
            <Link href="/ajuda" className="hover:text-blue-200">Ajuda</Link>
          </div>
        </motion.div>
      </footer>
    </div>
  )
} 