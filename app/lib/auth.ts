// Sistema simples de autenticação
export interface User {
  id: string
  name: string
  email: string
  isActive: boolean
}

// Função para verificar se o usuário está logado
export function isUserLoggedIn(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('flashconcards_user') !== null
}

// Função para fazer login
export function loginUser(user: User): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('flashconcards_user', JSON.stringify(user))
}

// Função para fazer logout
export function logoutUser(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('flashconcards_user')
}

// Função para obter dados do usuário logado
export function getLoggedInUser(): User | null {
  if (typeof window === 'undefined') return null
  const userData = localStorage.getItem('flashconcards_user')
  return userData ? JSON.parse(userData) : null
}

// Função para obter o dashboard correto baseado no status de login
export function getDashboardUrl(): string {
  return isUserLoggedIn() ? '/dashboard/paid' : '/dashboard'
} 