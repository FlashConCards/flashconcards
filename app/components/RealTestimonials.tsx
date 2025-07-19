'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, MessageSquare } from 'lucide-react'
import { getRealTestimonials } from '../lib/data'

export default function RealTestimonials() {
  const [testimonials, setTestimonials] = useState<any[]>([])

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const testimonialsData = await getRealTestimonials()
        setTestimonials(testimonialsData)
      } catch (error) {
        console.error('Erro ao carregar depoimentos:', error)
      }
    }
    
    loadTestimonials()
  }, [])

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Depoimentos dos Candidatos
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Feedback real de candidatos que usaram o FlashConCards para se preparar para o concurso da ALEGO
          </p>
        </div>

        {testimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
              >
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <span className="text-white/70 text-sm ml-2">
                    {testimonial.rating}/5
                  </span>
                </div>
                
                <div className="flex items-start mb-4">
                  <MessageSquare className="text-blue-400 mr-3 mt-1" size={20} />
                  <p className="text-white/90 text-sm leading-relaxed">
                    "{testimonial.content}"
                  </p>
                </div>
                
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">
                      {testimonial.name}
                    </div>
                    <div className="text-white/60 text-xs">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="flex justify-center mb-4">
                <MessageSquare className="h-12 w-12 text-white/60" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Seja o primeiro candidato a deixar um feedback!
              </h3>
              <p className="text-white/80 max-w-md mx-auto">
                Quando você usar o FlashConCards e registrar seu resultado no concurso de Policial Legislativo, seu feedback aparecerá aqui para inspirar outros candidatos.
              </p>
              <div className="mt-6">
                <a 
                  href="/payment" 
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Começar a Estudar
                </a>
              </div>
            </div>
          </motion.div>
        )}

        <div className="text-center mt-12">
          <p className="text-white/60 text-sm">
            * Depoimentos reais de candidatos que registraram seus resultados no sistema
          </p>
        </div>
      </div>
    </section>
  )
} 