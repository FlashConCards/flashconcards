'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, PlayIcon, DocumentIcon, LinkIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { Deepening } from '@/types'
import ImageModal from '@/components/ImageModal'

interface DeepeningModalProps {
  isOpen: boolean
  onClose: () => void
  deepening: Deepening | null
}

export default function DeepeningModal({ isOpen, onClose, deepening }: DeepeningModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  
  if (!deepening) return null

  return (
    <>
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className={`fixed inset-0 transition-opacity ${darkMode ? 'bg-gray-900 bg-opacity-90' : 'bg-gray-500 bg-opacity-75'}`} />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className={`relative transform overflow-hidden rounded-lg shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-6xl sm:h-[90vh] sm:p-6 ${
                  darkMode 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-white text-gray-900'
                }`}>
                  
                  {/* Header com Dark Mode Toggle */}
                  <div className="flex items-center justify-between mb-6">
                    <Dialog.Title as="h3" className={`text-2xl font-bold leading-6 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {deepening.title}
                    </Dialog.Title>
                    
                    <div className="flex items-center space-x-4">
                      {/* Dark Mode Toggle */}
                      <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`p-2 rounded-lg transition-colors ${
                          darkMode 
                            ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {darkMode ? (
                          <SunIcon className="w-5 h-5" />
                        ) : (
                          <MoonIcon className="w-5 h-5" />
                        )}
                      </button>
                      
                      {/* Close Button */}
                      <button
                        type="button"
                        className={`rounded-md p-2 transition-colors ${
                          darkMode 
                            ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800' 
                            : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100'
                        }`}
                        onClick={onClose}
                      >
                        <span className="sr-only">Fechar</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Content Area with Proper Scrolling */}
                  <div className={`h-full overflow-y-auto pr-2 ${
                    darkMode ? 'scrollbar-dark' : 'scrollbar-light'
                  }`}>
                    <div className="space-y-6">
                      {/* Conteúdo Principal com Formatação Melhorada */}
                      <div className={`prose prose-lg max-w-none ${
                        darkMode 
                          ? 'prose-invert prose-gray-300' 
                          : 'prose-gray-900'
                      }`}>
                        <div 
                          className={`leading-relaxed ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}
                          dangerouslySetInnerHTML={{ 
                            __html: deepening.content 
                              .replace(/<h1>/g, '<h1 class="text-3xl font-bold mb-4 mt-6 text-blue-600">')
                              .replace(/<h2>/g, '<h2 class="text-2xl font-bold mb-3 mt-5 text-blue-500">')
                              .replace(/<h3>/g, '<h3 class="text-xl font-semibold mb-2 mt-4 text-blue-400">')
                              .replace(/<h4>/g, '<h4 class="text-lg font-semibold mb-2 mt-3 text-blue-300">')
                              .replace(/<p>/g, '<p class="mb-3 leading-relaxed">')
                              .replace(/<ul>/g, '<ul class="list-disc list-inside mb-3 space-y-1">')
                              .replace(/<ol>/g, '<ol class="list-decimal list-inside mb-3 space-y-1">')
                              .replace(/<li>/g, '<li class="ml-4">')
                              .replace(/<strong>/g, '<strong class="font-bold text-blue-600">')
                              .replace(/<em>/g, '<em class="italic text-gray-600">')
                              .replace(/<blockquote>/g, '<blockquote class="border-l-4 border-blue-500 pl-4 italic bg-gray-50 p-3 rounded">')
                          }} 
                        />
                      </div>

                      {/* Imagens */}
                      {deepening.images && deepening.images.length > 0 && (
                        <div>
                          <h4 className={`text-lg font-semibold mb-3 ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>Imagens</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {deepening.images.map((image, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={image}
                                  alt={`Imagem ${index + 1}`}
                                  className="w-full h-auto max-h-96 object-contain rounded-lg shadow-md group-hover:shadow-lg transition-shadow cursor-pointer"
                                  onClick={() => setSelectedImage(image)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Vídeos */}
                      {deepening.videos && deepening.videos.length > 0 && (
                        <div>
                          <h4 className={`text-lg font-semibold mb-3 ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>Vídeos</h4>
                          <div className="space-y-4">
                            {deepening.videos.map((video, index) => (
                              <div key={index} className="relative">
                                {video.includes('youtube.com') || video.includes('youtu.be') ? (
                                  <div className="aspect-video">
                                    <iframe
                                      src={video.replace('watch?v=', 'embed/')}
                                      title={`Vídeo ${index + 1}`}
                                      className="w-full h-full rounded-lg"
                                      frameBorder="0"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                    />
                                  </div>
                                ) : (
                                  <video
                                    controls
                                    className="w-full rounded-lg"
                                    src={video}
                                  >
                                    Seu navegador não suporta vídeos.
                                  </video>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* PDFs */}
                      {deepening.pdfs && deepening.pdfs.length > 0 && (
                        <div>
                          <h4 className={`text-lg font-semibold mb-3 ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>Documentos</h4>
                          <div className="space-y-2">
                            {deepening.pdfs.map((pdf, index) => (
                              <a
                                key={index}
                                href={pdf}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2 p-3 border rounded-lg transition-colors ${
                                  darkMode 
                                    ? 'border-gray-700 hover:bg-gray-800 text-gray-300' 
                                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                                }`}
                              >
                                <DocumentIcon className="w-5 h-5 text-red-500" />
                                <span>Documento {index + 1}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Links Externos */}
                      {deepening.externalLinks && deepening.externalLinks.length > 0 && (
                        <div>
                          <h4 className={`text-lg font-semibold mb-3 ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>Links Úteis</h4>
                          <div className="space-y-2">
                            {deepening.externalLinks.map((link, index) => (
                              <a
                                key={index}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2 p-3 border rounded-lg transition-colors ${
                                  darkMode 
                                    ? 'border-gray-700 hover:bg-gray-800 text-gray-300' 
                                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                                }`}
                              >
                                <LinkIcon className="w-5 h-5 text-blue-500" />
                                <span>Link {index + 1}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
      
      {/* Modal de Imagem */}
      <ImageModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage || ''}
        alt="Imagem em tamanho completo"
      />
    </>
  )
} 