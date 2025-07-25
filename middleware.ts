import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Proteger rota do admin
  if (pathname.startsWith('/admin')) {
    // Verificar se há cookie de autenticação ou token
    const authToken = request.cookies.get('auth_token')?.value
    const userData = request.cookies.get('flashconcards_user')?.value
    
    if (!authToken && !userData) {
      // Se não há autenticação, redirecionar para login
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Proteger dashboard pago
  if (pathname.startsWith('/dashboard/paid')) {
    const userData = request.cookies.get('flashconcards_user')?.value
    
    if (!userData) {
      // Se não há dados de usuário, redirecionar para login
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Proteger rotas de estudo (opcional)
  if (pathname.startsWith('/study')) {
    const userData = request.cookies.get('flashconcards_user')?.value
    
    if (!userData) {
      // Se não há dados de usuário, redirecionar para login
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/paid/:path*',
    '/study/:path*',
    '/perfil/:path*'
  ]
} 