'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, PlayIcon, DocumentIcon, LinkIcon } from '@heroicons/react/24/outline'
import { Deepening } from '@/types'

interface DeepeningModalProps {
  isOpen: boolean
  onClose: () => void
  deepening: Deepening | null
}

export default function DeepeningModal({ isOpen, onClose, deepening }: DeepeningModalProps) {
  if (!deepening) return null

  return (
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
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-6xl sm:h-[90vh] sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Fechar</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-gray-900 mb-6">
                      {deepening.title}
                    </Dialog.Title>
                    
                    <div className="mt-4 space-y-6 h-full overflow-y-auto">
                      {/* Conteúdo Principal */}
                      <div className="prose prose-sm sm:prose lg:prose-lg mx-auto max-w-none">
                        <div 
                          className="text-gray-700 leading-relaxed text-lg"
                          dangerouslySetInnerHTML={{ __html: deepening.content }}
                        />
                      </div>

                      {/* Imagens */}
                      {deepening.images.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">Imagens</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {deepening.images.map((image, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={image}
                                  alt={`Imagem ${index + 1}`}
                                  className="w-full h-48 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Vídeos */}
                      {deepening.videos.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">Vídeos</h4>
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
                      {deepening.pdfs.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">Documentos</h4>
                          <div className="space-y-2">
                            {deepening.pdfs.map((pdf, index) => (
                              <a
                                key={index}
                                href={pdf}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <DocumentIcon className="w-5 h-5 text-red-500" />
                                <span className="text-gray-700">Documento {index + 1}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Links Externos */}
                      {deepening.externalLinks.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">Links Úteis</h4>
                          <div className="space-y-2">
                            {deepening.externalLinks.map((link, index) => (
                              <a
                                key={index}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <LinkIcon className="w-5 h-5 text-blue-500" />
                                <span className="text-gray-700">Link {index + 1}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
} 