import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'API temporariamente desabilitada para build',
    status: 'disabled'
  })
} 