import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const googleAppsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL
    
    if (!googleAppsScriptUrl) {
      return NextResponse.json({
        success: false,
        error: 'GOOGLE_APPS_SCRIPT_URL não configurada'
      })
    }

    // Teste simples para o Google Apps Script
    const testData = {
      type: 'welcome',
      to: 'teste@email.com',
      subject: 'Teste',
      userName: 'Teste',
      courseName: 'Curso Teste'
    }

    console.log('🔍 Testando Google Apps Script URL:', googleAppsScriptUrl)
    
    const response = await fetch(googleAppsScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })

    console.log('📊 Status da resposta:', response.status)
    console.log('📊 Status text:', response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.log('❌ Erro da resposta:', errorText)
      
      return NextResponse.json({
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        details: errorText
      })
    }

    const result = await response.json()
    console.log('✅ Resposta do Google Apps Script:', result)
    
    return NextResponse.json({
      success: true,
      result
    })
  } catch (error) {
    console.error('❌ Erro no teste:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
} 