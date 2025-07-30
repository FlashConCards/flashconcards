import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'image', 'video', 'pdf'
    const path = formData.get('path') as string

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Nenhum arquivo fornecido' },
        { status: 400 }
      )
    }

    // Validar tipo de arquivo
    const allowedTypes = {
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      video: ['video/mp4', 'video/webm', 'video/ogg'],
      pdf: ['application/pdf']
    }

    if (!allowedTypes[type as keyof typeof allowedTypes]?.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Tipo de arquivo não permitido' },
        { status: 400 }
      )
    }

    // Validar tamanho do arquivo (10MB máximo)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'Arquivo muito grande. Máximo 10MB.' },
        { status: 400 }
      )
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now()
    const fileName = `${type}/${timestamp}_${file.name}`
    const fullPath = path ? `${path}/${fileName}` : fileName

    // Mock: Upload para Firebase Storage (temporário para deploy)
    const downloadURL = `https://mock-storage-url.com/${fullPath}`

    return NextResponse.json({
      success: true,
      url: downloadURL,
      path: fullPath,
      fileName: file.name,
      size: file.size,
      type: file.type
    })

  } catch (error) {
    console.error('Erro no upload:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao fazer upload do arquivo' },
      { status: 500 }
    )
  }
} 