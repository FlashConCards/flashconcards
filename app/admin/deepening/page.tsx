'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  Bars3Icon,
  ListBulletIcon,
  LinkIcon,
  PhotoIcon,
  PlayIcon,
  DocumentIcon
} from '@heroicons/react/24/outline'

interface Deepening {
  id: string
  flashcardId: string
  title: string
  content: string
  images: string[]
  videos: string[]
  pdfs: string[]
  externalLinks: string[]
  isActive: boolean
}

// Mock data
const mockDeepenings: Deepening[] = [
  {
    id: '1',
    flashcardId: '1',
    title: 'Soberania Popular - Aprofundamento',
    content: `
      <h2 style="color: #1f2937; font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">Fundamentação Legal</h2>
      <p style="margin-bottom: 1rem;"><strong style="color: #059669;">Art. 1º da Constituição Federal:</strong> A República Federativa do Brasil, formada pela união indissolúvel dos Estados e Municípios e do Distrito Federal, constitui-se em Estado Democrático de Direito e tem como fundamentos:</p>
      <ul style="margin-bottom: 1rem; padding-left: 2rem;">
        <li style="margin-bottom: 0.5rem;"><strong style="color: #dc2626;">I</strong> - a soberania;</li>
        <li style="margin-bottom: 0.5rem;"><strong style="color: #dc2626;">II</strong> - a cidadania;</li>
        <li style="margin-bottom: 0.5rem;"><strong style="color: #dc2626;">III</strong> - a dignidade da pessoa humana;</li>
        <li style="margin-bottom: 0.5rem;"><strong style="color: #dc2626;">IV</strong> - os valores sociais do trabalho e da livre iniciativa;</li>
        <li style="margin-bottom: 0.5rem;"><strong style="color: #dc2626;">V</strong> - o pluralismo político.</li>
      </ul>
      <h2 style="color: #1f2937; font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">Explicação Detalhada</h2>
      <p style="margin-bottom: 1rem;">A <em style="color: #7c3aed;">soberania popular</em> é o princípio fundamental que estabelece que todo o poder emana do povo, que o exerce por meio de representantes eleitos ou diretamente, nos termos desta Constituição.</p>
    `,
    images: ['/api/placeholder/400/200'],
    videos: ['https://www.youtube.com/watch?v=example'],
    pdfs: ['/api/placeholder/400/600'],
    externalLinks: ['https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm'],
    isActive: true,
  },
  {
    id: '2',
    flashcardId: '2',
    title: 'Separação de Poderes - Aprofundamento',
    content: `
      <h2 style="color: #1f2937; font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">Conceito</h2>
      <p style="margin-bottom: 1rem;">A <strong style="color: #059669;">separação de poderes</strong> é um princípio fundamental da democracia que visa evitar a concentração de poder em uma única pessoa ou órgão.</p>
      <h2 style="color: #1f2937; font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">Os Três Poderes</h2>
      <ol style="margin-bottom: 1rem; padding-left: 2rem;">
        <li style="margin-bottom: 0.5rem;"><strong style="color: #dc2626;">Poder Legislativo:</strong> Cria as leis</li>
        <li style="margin-bottom: 0.5rem;"><strong style="color: #dc2626;">Poder Executivo:</strong> Executa as leis</li>
        <li style="margin-bottom: 0.5rem;"><strong style="color: #dc2626;">Poder Judiciário:</strong> Julga conflitos</li>
      </ol>
    `,
    images: ['/api/placeholder/400/200'],
    videos: ['https://www.youtube.com/watch?v=example2'],
    pdfs: ['/api/placeholder/400/600'],
    externalLinks: ['https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm'],
    isActive: true,
  },
]

export default function AdminDeepeningPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [deepenings, setDeepenings] = useState<Deepening[]>(mockDeepenings)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingDeepening, setEditingDeepening] = useState<Deepening | null>(null)
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [flashcardId, setFlashcardId] = useState('')

  // Editor states
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [textColor, setTextColor] = useState('#000000')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [fontSize, setFontSize] = useState('16px')
  const [fontFamily, setFontFamily] = useState('Arial')

  // Verificar se é admin
  const isAdmin = user?.isAdmin || user?.email === 'admin@flashconcards.com' || 
                  user?.email === 'claudioghabryel.cg@gmail.com' || 
                  user?.email === 'natalhia775@gmail.com'

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h2>
          <p className="text-gray-600 mb-4">Você não tem permissão para acessar esta página.</p>
          <button
            onClick={() => router.push('/admin')}
            className="btn-primary"
          >
            Voltar ao Admin
          </button>
        </div>
      </div>
    )
  }

  const handleAddDeepening = () => {
    setEditingDeepening(null)
    setTitle('')
    setContent('')
    setFlashcardId('')
    setShowModal(true)
  }

  const handleEditDeepening = (deepening: Deepening) => {
    setEditingDeepening(deepening)
    setTitle(deepening.title)
    setContent(deepening.content)
    setFlashcardId(deepening.flashcardId)
    setShowModal(true)
  }

  const handleToggleStatus = (deepeningId: string) => {
    setDeepenings(prev => prev.map(deepening => 
      deepening.id === deepeningId 
        ? { ...deepening, isActive: !deepening.isActive }
        : deepening
    ))
  }

  const handleDeleteDeepening = (deepeningId: string) => {
    if (confirm('Tem certeza que deseja excluir este aprofundamento?')) {
      setDeepenings(prev => prev.filter(deepening => deepening.id !== deepeningId))
    }
  }

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    if (editingDeepening) {
      setDeepenings(prev => prev.map(deepening => 
        deepening.id === editingDeepening.id 
          ? { ...deepening, title, content, flashcardId }
          : deepening
      ))
    } else {
      const newDeepening: Deepening = {
        id: Date.now().toString(),
        flashcardId,
        title,
        content,
        images: [],
        videos: [],
        pdfs: [],
        externalLinks: [],
        isActive: true,
      }
      setDeepenings(prev => [...prev, newDeepening])
    }
    setShowModal(false)
  }

  // Editor functions
  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value)
  }

  const insertHTML = (html: string) => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      range.deleteContents()
      const div = document.createElement('div')
      div.innerHTML = html
      range.insertNode(div.firstChild || div)
    }
  }

  const filteredDeepenings = deepenings.filter(deepening =>
    deepening.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deepening.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin')}
                className="btn-outline flex items-center gap-2"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Voltar
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gerenciar Aprofundamentos</h1>
                <p className="text-gray-600">Crie e edite conteúdo detalhado para flashcards</p>
              </div>
            </div>
            <button
              onClick={handleAddDeepening}
              className="btn-primary flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Adicionar Aprofundamento
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar aprofundamentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field w-full max-w-md"
          />
        </div>

        {/* Deepenings List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Aprofundamentos ({filteredDeepenings.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Flashcard ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mídia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDeepenings.map((deepening) => (
                  <tr key={deepening.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{deepening.title}</div>
                      <div className="text-sm text-gray-500 max-w-xs truncate" 
                           dangerouslySetInnerHTML={{ __html: deepening.content.substring(0, 100) + '...' }} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {deepening.flashcardId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        deepening.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {deepening.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        {deepening.images.length > 0 && <PhotoIcon className="w-4 h-4 text-blue-600" />}
                        {deepening.videos.length > 0 && <PlayIcon className="w-4 h-4 text-red-600" />}
                        {deepening.pdfs.length > 0 && <DocumentIcon className="w-4 h-4 text-green-600" />}
                        <span>{deepening.images.length + deepening.videos.length + deepening.pdfs.length} arquivos</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditDeepening(deepening)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(deepening.id)}
                          className={deepening.isActive ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}
                        >
                          {deepening.isActive ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteDeepening(deepening.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingDeepening ? 'Editar Aprofundamento' : 'Adicionar Aprofundamento'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Flashcard ID
                    </label>
                    <input
                      type="text"
                      value={flashcardId}
                      onChange={(e) => setFlashcardId(e.target.value)}
                      className="input-field"
                      placeholder="ID do flashcard"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="input-field"
                      placeholder="Título do aprofundamento"
                    />
                  </div>
                </div>

                {/* Rich Text Editor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conteúdo (Editor Rico)
                  </label>
                  
                  {/* Toolbar */}
                  <div className="border border-gray-300 rounded-t-lg bg-gray-50 p-2 flex flex-wrap items-center gap-2">
                    {/* Text Formatting */}
                    <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
                      <button
                        onClick={() => execCommand('bold')}
                        className={`p-2 rounded hover:bg-gray-200 ${isBold ? 'bg-gray-300' : ''}`}
                        title="Negrito"
                      >
                        <BoldIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => execCommand('italic')}
                        className={`p-2 rounded hover:bg-gray-200 ${isItalic ? 'bg-gray-300' : ''}`}
                        title="Itálico"
                      >
                        <ItalicIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => execCommand('underline')}
                        className={`p-2 rounded hover:bg-gray-200 ${isUnderline ? 'bg-gray-300' : ''}`}
                        title="Sublinhado"
                      >
                        <UnderlineIcon className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Alignment */}
                    <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
                      <button
                        onClick={() => execCommand('justifyLeft')}
                        className="p-2 rounded hover:bg-gray-200"
                        title="Alinhar à Esquerda"
                      >
                        <Bars3Icon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => execCommand('justifyCenter')}
                        className="p-2 rounded hover:bg-gray-200"
                        title="Centralizar"
                      >
                        <Bars3Icon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => execCommand('justifyRight')}
                        className="p-2 rounded hover:bg-gray-200"
                        title="Alinhar à Direita"
                      >
                        <Bars3Icon className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Lists */}
                    <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
                      <button
                        onClick={() => execCommand('insertUnorderedList')}
                        className="p-2 rounded hover:bg-gray-200"
                        title="Lista não ordenada"
                      >
                        <ListBulletIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => execCommand('insertOrderedList')}
                        className="p-2 rounded hover:bg-gray-200"
                        title="Lista ordenada"
                      >
                        <ListBulletIcon className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Colors */}
                    <div className="flex items-center space-x-2 border-r border-gray-300 pr-2">
                      <label className="text-xs text-gray-600">Cor:</label>
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => {
                          setTextColor(e.target.value)
                          execCommand('foreColor', e.target.value)
                        }}
                        className="w-8 h-8 rounded border border-gray-300"
                      />
                      <label className="text-xs text-gray-600">Fundo:</label>
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => {
                          setBackgroundColor(e.target.value)
                          execCommand('hiliteColor', e.target.value)
                        }}
                        className="w-8 h-8 rounded border border-gray-300"
                      />
                    </div>

                    {/* Font Size */}
                    <div className="flex items-center space-x-2 border-r border-gray-300 pr-2">
                      <label className="text-xs text-gray-600">Tamanho:</label>
                      <select
                        value={fontSize}
                        onChange={(e) => {
                          setFontSize(e.target.value)
                          execCommand('fontSize', e.target.value)
                        }}
                        className="text-xs border border-gray-300 rounded px-1 py-1"
                      >
                        <option value="12px">12px</option>
                        <option value="14px">14px</option>
                        <option value="16px">16px</option>
                        <option value="18px">18px</option>
                        <option value="20px">20px</option>
                        <option value="24px">24px</option>
                        <option value="28px">28px</option>
                        <option value="32px">32px</option>
                      </select>
                    </div>

                    {/* Font Family */}
                    <div className="flex items-center space-x-2">
                      <label className="text-xs text-gray-600">Fonte:</label>
                      <select
                        value={fontFamily}
                        onChange={(e) => {
                          setFontFamily(e.target.value)
                          execCommand('fontName', e.target.value)
                        }}
                        className="text-xs border border-gray-300 rounded px-1 py-1"
                      >
                        <option value="Arial">Arial</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Helvetica">Helvetica</option>
                      </select>
                    </div>
                  </div>

                  {/* Editor Area */}
                  <div
                    contentEditable
                    className="border border-gray-300 rounded-b-lg p-4 min-h-64 max-h-96 overflow-y-auto focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    onInput={(e) => setContent(e.currentTarget.innerHTML)}
                    dangerouslySetInnerHTML={{ __html: content }}
                    style={{ fontFamily, fontSize }}
                  />
                </div>

                {/* Media Upload */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <PhotoIcon className="w-4 h-4 mr-2" />
                      Imagens
                    </h4>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="input-field"
                    />
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <PlayIcon className="w-4 h-4 mr-2" />
                      Vídeos
                    </h4>
                    <input
                      type="file"
                      accept="video/*"
                      multiple
                      className="input-field"
                    />
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <DocumentIcon className="w-4 h-4 mr-2" />
                      PDFs
                    </h4>
                    <input
                      type="file"
                      accept=".pdf"
                      multiple
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="btn-outline"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="btn-primary"
                  >
                    {editingDeepening ? 'Salvar' : 'Adicionar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 