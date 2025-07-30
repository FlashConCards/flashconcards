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
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f0f9ff',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        textAlign: 'center', 
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: '500px'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 'bold', 
          color: '#1f2937',
          marginBottom: '1rem'
        }}>
          FlashConCards
        </h1>
        <p style={{ 
          fontSize: '1.25rem', 
          color: '#6b7280',
          marginBottom: '2rem'
        }}>
          Teste de Deploy - Se você está vendo esta página, está funcionando!
        </p>
        <div style={{ 
          backgroundColor: '#f3f4f6',
          padding: '1rem',
          borderRadius: '4px',
          marginTop: '1rem'
        }}>
          <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>
            <strong>Status:</strong> <span style={{ color: '#059669' }}>✅ Online</span>
          </p>
          <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>
            <strong>URL:</strong> flashconcards.vercel.app
          </p>
          <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>
            <strong>Deploy:</strong> <span style={{ color: '#059669' }}>✅ Sucesso</span>
          </p>
        </div>
      </div>
    </div>
  )
} 