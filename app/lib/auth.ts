// Sistema de autenticação melhorado
export interface User {
  id: string
  name: string
  email: string
  isActive: boolean
  uid?: string
  isPaid?: boolean
  hasAccess?: boolean
}

// Função para verificar se o usuário está logado
export function isUserLoggedIn(): boolean {
  if (typeof window === 'undefined') return false
  
  // Verificar localStorage
  const localStorageUser = localStorage.getItem('flashconcards_user')
  if (localStorageUser) return true
  
  // Verificar cookies
  const cookies = document.cookie.split(';')
  const userCookie = cookies.find(cookie => cookie.trim().startsWith('flashconcards_user='))
  return !!userCookie
}

// Função para fazer login
export function loginUser(user: User): void {
  if (typeof window === 'undefined') return
  
  // Salvar no localStorage
  localStorage.setItem('flashconcards_user', JSON.stringify(user))
  
  // Salvar no cookie também
  const userData = JSON.stringify(user)
  document.cookie = `flashconcards_user=${encodeURIComponent(userData)}; path=/; max-age=2592000; secure; samesite=strict`
}

// Função para fazer logout
export function logoutUser(): void {
  if (typeof window === 'undefined') return
  
  // Remover do localStorage
  localStorage.removeItem('flashconcards_user')
  
  // Remover cookie
  document.cookie = 'flashconcards_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
}

// Função para obter dados do usuário logado
export function getLoggedInUser(): User | null {
  if (typeof window === 'undefined') return null
  
  // Tentar localStorage primeiro
  const localStorageUser = localStorage.getItem('flashconcards_user')
  if (localStorageUser) {
    try {
      return JSON.parse(localStorageUser)
    } catch (error) {
      console.error('Erro ao parsear dados do localStorage:', error)
    }
  }
  
  // Tentar cookie
  const cookies = document.cookie.split(';')
  const userCookie = cookies.find(cookie => cookie.trim().startsWith('flashconcards_user='))
  if (userCookie) {
    try {
      const userData = decodeURIComponent(userCookie.split('=')[1])
      return JSON.parse(userData)
    } catch (error) {
      console.error('Erro ao parsear dados do cookie:', error)
    }
  }
  
  return null
}

// Função para obter o dashboard correto baseado no status de login
export function getDashboardUrl(): string {
  return isUserLoggedIn() ? '/dashboard/paid' : '/dashboard'
}

// Função para verificar se o usuário tem acesso pago
export async function checkPaidAccess(user: User): Promise<boolean> {
  if (typeof window === 'undefined') return false
  
  try {
    // Verificar se já temos a informação no objeto user
    if (user.isPaid || user.hasAccess) return true
    
    // Se não, verificar no Firestore
    const { db } = await import('./firebase')
    const { doc, getDoc } = await import('firebase/firestore')
    
    const userId = user.uid || user.id || user.email?.replace(/[^a-zA-Z0-9]/g, '_') || 'unknown'
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    
    if (userDoc.exists()) {
      const userData = userDoc.data()
      return !!(userData.isPaid || userData.hasAccess)
    }
    
    return false
  } catch (error) {
    console.error('Erro ao verificar acesso pago:', error)
    return false
  }
} 