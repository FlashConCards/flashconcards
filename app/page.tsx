'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import {
  BookOpenIcon,
  AcademicCapIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  StarIcon,
  ArrowRightIcon,
  PlayIcon,
  ChartBarIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

// Mock data para cursos
const mockCourses = [
  {
    id: 'inss',
    name: 'INSS - Instituto Nacional do Seguro Social',
    description: 'Preparação completa para o concurso do INSS com foco em Direito Previdenciário, Administrativo e Constitucional.',
    image: '/api/placeholder/400/200',
    price: 99.90,
    isActive: true,
    subjects: 4,
    flashcards: 250,
    students: 1250,
    rating: 4.8,
    features: ['Direito Previdenciário', 'Direito Administrativo', 'Direito Constitucional', 'Matemática Financeira']
  },
  {
    id: 'tj',
    name: 'TJ - Tribunal de Justiça',
    description: 'Concurso para cargos de técnico e analista judiciário com matérias específicas do Direito.',
    image: '/api/placeholder/400/200',
    price: 99.90,
    isActive: true,
    subjects: 5,
    flashcards: 300,
    students: 890,
    rating: 4.7,
    features: ['Direito Civil', 'Direito Penal', 'Direito Processual', 'Direito Constitucional']
  },
  {
    id: 'pm',
    name: 'PM - Polícia Militar',
    description: 'Preparação para concursos de soldado e oficial da Polícia Militar com foco em Direito Penal e Constitucional.',
    image: '/api/placeholder/400/200',
    price: 99.90,
    isActive: true,
    subjects: 3,
    flashcards: 180,
    students: 2100,
    rating: 4.9,
    features: ['Direito Penal', 'Direito Constitucional', 'Legislação Específica']
  }
]

const features = [
  {
    icon: BookOpenIcon,
    title: 'Flashcards Inteligentes',
    description: 'Sistema de repetição espaçada que adapta-se ao seu ritmo de aprendizado'
  },
  {
    icon: ChartBarIcon,
    title: 'Progresso em Tempo Real',
    description: 'Acompanhe seu desempenho com gráficos detalhados e estatísticas'
  },
  {
    icon: LightBulbIcon,
    title: 'Aprofundamento Detalhado',
    description: 'Conteúdo rico com imagens, vídeos e PDFs para estudo completo'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Acesso Seguro',
    description: 'Plataforma protegida com autenticação e dados criptografados'
  }
]

const testimonials = [
  {
    name: 'Maria Silva',
    role: 'Aprovada no INSS',
    content: 'Os flashcards me ajudaram muito! Consegui memorizar todo o conteúdo de forma eficiente.',
    rating: 5
  },
  {
    name: 'João Santos',
    role: 'Aprovado no TJ',
    content: 'A plataforma é incrível! O sistema de repetição espaçada fez toda a diferença.',
    rating: 5
  },
  {
    name: 'Ana Costa',
    role: 'Aprovada na PM',
    content: 'Conteúdo de qualidade e interface intuitiva. Recomendo para todos!',
    rating: 5
  }
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            FlashConCards
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Plataforma de estudos para concursos com flashcards inteligentes
          </p>
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Teste de Deploy</h2>
            <p className="text-gray-600 mb-4">
              Se você está vendo esta página, o deploy está funcionando!
            </p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="text-green-600 font-semibold">✅ Funcionando</span>
              </div>
              <div className="flex justify-between">
                <span>URL:</span>
                <span className="text-blue-600">flashconcards.vercel.app</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 