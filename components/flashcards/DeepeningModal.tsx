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
  
  // Se não há deepening, criar um objeto padrão
  const displayDeepening = deepening || {
    title: 'Informações do Tópico',
    content: 'Este tópico ainda não possui aprofundamento específico. O conteúdo será baseado na descrição geral do tópico.',
    subTopicId: '',
    images: [],
    externalLinks: []
  }

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
                      {displayDeepening.title}
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
                      <div className={`prose max-w-none ${
                        darkMode ? 'prose-invert' : ''
                      }`}>
                        <div 
                          className={`text-lg leading-relaxed ${
                            darkMode ? 'text-gray-200' : 'text-gray-800'
                          }`}
                          dangerouslySetInnerHTML={{ __html: displayDeepening.content }}
                        />
                      </div>

                      {/* Imagens (se houver) */}
                      {displayDeepening.images && displayDeepening.images.length > 0 && (
                        <div className="space-y-4">
                          <h4 className={`text-lg font-semibold ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            Imagens de Apoio
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {displayDeepening.images.map((image, index) => {
                              // Lidar com formato antigo (string) e novo (objeto)
                              const imageUrl = typeof image === 'string' ? image : image.url;
                              const imageAlt = typeof image === 'string' ? `Imagem ${index + 1}` : (image.alt || `Imagem ${index + 1}`);
                              const imageCaption = typeof image === 'string' ? undefined : image.caption;
                              
                              return (
                                <div key={index} className="relative group">
                                  <img
                                    src={imageUrl}
                                    alt={imageAlt}
                                    className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => setSelectedImage(imageUrl)}
                                  />
                                  {imageCaption && (
                                    <p className={`text-sm mt-2 text-center ${
                                      darkMode ? 'text-gray-300' : 'text-gray-600'
                                    }`}>
                                      {imageCaption}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Links (se houver) */}
                      {displayDeepening.externalLinks && displayDeepening.externalLinks.length > 0 && (
                        <div className="space-y-4">
                          <h4 className={`text-lg font-semibold ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            Links Relacionados
                          </h4>
                          <div className="space-y-3">
                            {displayDeepening.externalLinks.map((link: any, index: number) => {
                              // Lidar com formato antigo (string) e novo (objeto)
                              const linkUrl = typeof link === 'string' ? link : link.url;
                              const linkTitle = typeof link === 'string' ? `Link ${index + 1}` : link.title;
                              const linkDescription = typeof link === 'string' ? undefined : link.description;
                              
                              return (
                                <a
                                  key={index}
                                  href={linkUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                                    darkMode 
                                      ? 'border-gray-700 hover:border-gray-600 hover:bg-gray-800' 
                                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                  }`}
                                >
                                  <LinkIcon className="w-5 h-5 text-blue-500" />
                                  <div>
                                    <p className={`font-medium ${
                                      darkMode ? 'text-white' : 'text-gray-900'
                                    }`}>
                                      {linkTitle}
                                    </p>
                                    {linkDescription && (
                                      <p className={`text-sm ${
                                        darkMode ? 'text-gray-400' : 'text-gray-600'
                                      }`}>
                                        {linkDescription}
                                      </p>
                                    )}
                                  </div>
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Mensagem quando não há aprofundamento */}
                      {!deepening && (
                        <div className={`p-4 rounded-lg border-2 border-dashed ${
                          darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-50'
                        }`}>
                          <div className="text-center">
                            <DocumentIcon className={`w-12 h-12 mx-auto mb-3 ${
                              darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`} />
                            <p className={`text-lg font-medium mb-2 ${
                              darkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              Sem Aprofundamento Específico
                            </p>
                            <p className={`text-sm ${
                              darkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              Este tópico ainda não possui conteúdo aprofundado. Os flashcards gerados por IA serão baseados na descrição geral do tópico.
                            </p>
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

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          alt="Imagem em tamanho completo"
        />
      )}
    </>
  )
} 