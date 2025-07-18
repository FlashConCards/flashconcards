import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const mercadoPagoToken = process.env.MERCADO_PAGO_ACCESS_TOKEN

  return NextResponse.json({
    message: 'Debug detalhado das variáveis de ambiente:',
    variables: {
      supabaseUrl: {
        value: supabaseUrl ? 'Presente' : 'AUSENTE',
        length: supabaseUrl?.length || 0,
        startsWith: supabaseUrl?.substring(0, 20) + '...' || 'N/A'
      },
      supabaseKey: {
        value: supabaseKey ? 'Presente' : 'AUSENTE',
        length: supabaseKey?.length || 0,
        startsWith: supabaseKey?.substring(0, 20) + '...' || 'N/A'
      },
      mercadoPagoToken: {
        value: mercadoPagoToken ? 'Presente' : 'AUSENTE',
        length: mercadoPagoToken?.length || 0,
        startsWith: mercadoPagoToken?.substring(0, 20) + '...' || 'N/A'
      }
    },
    allEnvVars: Object.keys(process.env).filter(key => 
      key.includes('SUPABASE') || key.includes('MERCADO')
    )
  })
} 