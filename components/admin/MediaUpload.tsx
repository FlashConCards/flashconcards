'use client'

import { useState, useRef } from 'react'
import { CloudArrowUpIcon, XMarkIcon, PhotoIcon, VideoCameraIcon, DocumentIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface MediaUploadProps {
  type: 'image' | 'video' | 'pdf'
  onUpload: (url: string) => void
  onRemove?: (url: string) => void
  multiple?: boolean
  maxFiles?: number
  className?: string
}

export default function MediaUpload({ 
  type, 
  onUpload, 
  onRemove, 
  multiple = false, 
  maxFiles = 5,
  className = '' 
}: MediaUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const allowedTypes = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/webm', 'video/ogg'],
    pdf: ['application/pdf']
  }

  const getIcon = () => {
    switch (type) {
      case 'image':
        return <PhotoIcon className="w-8 h-8 text-blue-500" />
      case 'video':
        return <VideoCameraIcon className="w-8 h-8 text-green-500" />
      case 'pdf':
        return <DocumentIcon className="w-8 h-8 text-red-500" />
      default:
        return <CloudArrowUpIcon className="w-8 h-8 text-gray-500" />
    }
  }

  const getTypeLabel = () => {
    switch (type) {
      case 'image':
        return 'Imagens'
      case 'video':
        return 'Vídeos'
      case 'pdf':
        return 'PDFs'
      default:
        return 'Arquivos'
    }
  }

  const handleFileUpload = async (files: FileList) => {
    if (uploadedFiles.length >= maxFiles) {
      toast.error(`Máximo de ${maxFiles} arquivos permitidos`)
      return
    }

    setUploading(true)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Validar tipo
        if (!allowedTypes[type].includes(file.type)) {
          toast.error(`Tipo de arquivo não permitido para ${getTypeLabel()}`)
          continue
        }

        // Validar tamanho (10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast.error('Arquivo muito grande. Máximo 10MB.')
          continue
        }

        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', type)
        formData.append('path', `admin/${type}`)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        const data = await response.json()

        if (data.success) {
          const newFiles = [...uploadedFiles, data.url]
          setUploadedFiles(newFiles)
          onUpload(data.url)
          toast.success(`${getTypeLabel()} enviado com sucesso!`)
        } else {
          toast.error(data.error || 'Erro ao fazer upload')
        }
      }
    } catch (error) {
      console.error('Erro no upload:', error)
      toast.error('Erro ao fazer upload do arquivo')
    } finally {
      setUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileUpload(e.dataTransfer.files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(e.target.files)
    }
  }

  const handleRemoveFile = (url: string) => {
    setUploadedFiles(uploadedFiles.filter(file => file !== url))
    onRemove?.(url)
  }

  return (
    <div className={className}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center">
          {getIcon()}
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {uploading ? 'Enviando...' : `Arraste ${getTypeLabel()} aqui`}
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            ou clique para selecionar
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="mt-4 btn-primary text-sm"
          >
            Selecionar {getTypeLabel()}
          </button>
        </div>
      </div>

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={allowedTypes[type].join(',')}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Uploaded Files Preview */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            {getTypeLabel()} Enviados ({uploadedFiles.length}/{maxFiles})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {uploadedFiles.map((url, index) => (
              <div key={index} className="relative group">
                {type === 'image' ? (
                  <img
                    src={url}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                    {type === 'video' ? (
                      <VideoCameraIcon className="w-8 h-8 text-gray-400" />
                    ) : (
                      <DocumentIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                )}
                <button
                  onClick={() => handleRemoveFile(url)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 