'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getApprovalRate, getActiveStudents, getTotalStudents } from '../lib/data'

export default function RealStats() {
  const [stats, setStats] = useState({
    approvalRate: 0,
    activeStudents: 0,
    totalStudents: 0
  })

  useEffect(() => {
    setStats({
      approvalRate: getApprovalRate(),
      activeStudents: getActiveStudents(),
      totalStudents: getTotalStudents()
    })
  }, [])

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Estatísticas do Preparatório
          </h2>
          <p className="text-white/90 max-w-3xl mx-auto">
            Dados que serão atualizados automaticamente conforme candidatos se cadastram e fazem o concurso
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">
                {stats.approvalRate}%
              </div>
              <div className="text-white font-semibold mb-2">
                Taxa de Aprovação
              </div>
              <div className="text-white/70 text-sm">
                Atualizada automaticamente com dados reais
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">
                {stats.activeStudents}+
              </div>
              <div className="text-white font-semibold mb-2">
                Estudantes Ativos
              </div>
              <div className="text-white/70 text-sm">
                Candidatos preparando-se para o concurso
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">
                {stats.totalStudents}+
              </div>
              <div className="text-white font-semibold mb-2">
                FlashConCards Específicos
              </div>
              <div className="text-white/70 text-sm">
                Conteúdo específico para Policial Legislativo da ALEGO
              </div>
            </div>
          </motion.div>
        </div>

        <div className="text-center mt-8">
          <p className="text-white/60 text-sm">
            * Estatísticas atualizadas em tempo real conforme candidatos se cadastram e fazem o concurso
          </p>
        </div>
      </div>
    </section>
  )
} 