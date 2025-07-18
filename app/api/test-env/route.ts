import { NextResponse } from 'next/server'

export async function GET() {
  const envVars = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configurado' : 'NÃO CONFIGURADO',
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configurado' : 'NÃO CONFIGURADO',
    mercadoPagoToken: process.env.MERCADO_PAGO_ACCESS_TOKEN ? 'Configurado' : 'NÃO CONFIGURADO'
  }

  return NextResponse.json({
    message: 'Status das variáveis de ambiente:',
    envVars
  })
} 