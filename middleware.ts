import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Proteger rota do admin
  if (pathname.startsWith('/admin')) {
    // Verificar se há email na URL
    const email = request.nextUrl.searchParams.get('email')
    
    if (!email) {
      // Se não há email, redirecionar para login
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Proteger dashboard pago
  if (pathname.startsWith('/dashboard/paid')) {
    const email = request.nextUrl.searchParams.get('email')
    
    if (!email) {
      // Se não há email na URL, redirecionar para login
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Proteger rotas de estudo (opcional)
  if (pathname.startsWith('/study')) {
    const email = request.nextUrl.searchParams.get('email')
    
    if (!email) {
      // Se não há email, redirecionar para login
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