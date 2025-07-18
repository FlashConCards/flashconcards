import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FlashConCards - Prepare-se para o Concurso ALEGO',
  description: 'Sistema de FlashConCards para preparação do concurso ALEGO. Estude de forma eficiente com nosso método comprovado.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  )
} 