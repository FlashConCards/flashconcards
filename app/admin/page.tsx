"use client";
import { useState, useEffect } from "react";
import conteudoProgramatico from '../../conteudo_programatico.json';
import { db, auth } from '../lib/firebase';
import { createUserWithEmailAndPassword, deleteUser, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, onSnapshot } from 'firebase/firestore';
import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';
import { BookOpen, Users, FileText, Settings, Plus, Trash2, Edit, Save, X } from 'lucide-react';

const ADMIN_EMAIL = "claudioghabryel7@gmail.com";

export default function AdminPage() {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [autenticado, setAutenticado] = useState(false);
  const [erro, setErro] = useState("");
  const [activeTab, setActiveTab] = useState('flashcards');

  // Painel admin
  const [preparatorio, setPreparatorio] = useState("ALEGO");
  const [materia, setMateria] = useState("");
  const [subtopico, setSubtopico] = useState("");
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [novaPergunta, setNovaPergunta] = useState("");
  const [novaResposta, setNovaResposta] = useState("");
  const [carregando, setCarregando] = useState(false);

  // Estado para editor de aprofundamento
  const [subtopicoAprof, setSubtopicoAprof] = useState('');
  const [conteudoAprof, setConteudoAprof] = useState('');
  const [salvandoAprof, setSalvandoAprof] = useState(false);
  const [msgAprof, setMsgAprof] = useState('');
  const [subtopicosSalvos, setSubtopicosSalvos] = useState<any[]>([]);

  // Usuários
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [novoEmail, setNovoEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [carregandoUsuarios, setCarregandoUsuarios] = useState(false);

  // Login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (login.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      setErro("Acesso negado. Email ou senha incorretos.");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, login.trim(), senha);
      setAutenticado(true);
      setErro("");
    } catch (err) {
      setErro("Acesso negado. Email ou senha incorretos.");
    }
  };

  // Carregar flashcards ao selecionar matéria
  useEffect(() => {
    if (!materia || !autenticado) return;
    setCarregando(true);
    const q = query(collection(db, 'flashcards'), where('preparatorio', '==', preparatorio), where('subject', '==', materia));
    const unsub = onSnapshot(q, (snapshot) => {
      setFlashcards(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setCarregando(false);
    });
    return () => unsub();
  }, [materia, preparatorio, autenticado]);

  // Carregar subtópicos salvos do Firestore
  useEffect(() => {
    if (!autenticado) return;
    const carregarSubtopicos = async () => {
      try {
        const { collection, getDocs } = await import('firebase/firestore');
        const { db } = await import('../lib/firebase');
        const snapshot = await getDocs(collection(db, 'subtopics'));
        const subtopicos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSubtopicosSalvos(subtopicos);
      } catch (error) {
        console.error('Erro ao carregar subtópicos:', error);
      }
    };
    carregarSubtopicos();
  }, [autenticado]);

  // Carregar lista de usuários
  useEffect(() => {
    if (!autenticado) return;
    setCarregandoUsuarios(true);
    fetch('/api/admin/list-users')
      .then(res => res.json())
      .then(data => {
        setUsuarios(data.users || []);
        setCarregandoUsuarios(false);
      });
  }, [autenticado]);

  // Subtópicos da matéria selecionada
  const subtitulos = materia ? (conteudoProgramatico.find((m: any) => m.titulo === materia)?.topicos || []) : [];

  // Combinar subtópicos do JSON com os salvos no Firestore
  const todosSubtopicos = [...subtitulos, ...subtopicosSalvos.map(s => s.name).filter(Boolean)];
  const subtopicosUnicos = Array.from(new Set(todosSubtopicos));

  // Agrupar subtópicos salvos por matéria
  const subtopicosPorMateria: Record<string, any[]> = {};
  subtopicosSalvos.forEach(sub => {
    let materiaIdentificada = 'Outros';
    for (const materia of conteudoProgramatico) {
      if (materia.topicos.includes(sub.name)) {
        materiaIdentificada = materia.titulo;
        break;
      }
    }
    if (!subtopicosPorMateria[materiaIdentificada]) {
      subtopicosPorMateria[materiaIdentificada] = [];
    }
    subtopicosPorMateria[materiaIdentificada].push(sub);
  });

  // Ao salvar o flashcard, garantir que o campo 'subject' seja o nome completo da matéria
  const getSubjectName = (subjectId: string) => {
    const subjects: { [key: string]: string } = {
      'portugues': 'Língua Portuguesa',
      'informatica': 'Noções de Informática',
      'constitucional': 'Direito Constitucional',
      'administrativo': 'Direito Administrativo',
      'realidade-goias': 'Realidade de Goiás',
      'legislacao-alego': 'Legislação ALEGO'
    };
    return subjects[subjectId] || subjectId;
  };

  // Adicionar flashcard
  const handleAddFlashcard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaPergunta.trim() || !novaResposta.trim() || !subtopico) return;
    await addDoc(collection(db, 'flashcards'), {
      preparatorio,
      subject: getSubjectName(materia),
      subtopico,
      question: novaPergunta,
      answer: novaResposta,
      created_at: new Date().toISOString(),
    });
    setNovaPergunta("");
    setNovaResposta("");
    setSubtopico("");
  };

  // Remover flashcard
  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'flashcards', id));
  };

  // Agrupar flashcards por subtópico
  const flashcardsPorSubtopico: Record<string, any[]> = {};
  flashcards.forEach(fc => {
    const key = fc.subtopico || "(Sem subtópico)";
    if (!flashcardsPorSubtopico[key]) flashcardsPorSubtopico[key] = [];
    flashcardsPorSubtopico[key].push(fc);
  });

  // Adicionar novo usuário
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoEmail || !novaSenha) return;
    await fetch('/api/admin/add-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: novoEmail, password: novaSenha })
    });
    setNovoEmail("");
    setNovaSenha("");
    fetch('/api/admin/list-users')
      .then(res => res.json())
      .then(data => setUsuarios(data.users || []));
  };

  // Remover usuário
  const handleDeleteUser = async (uid: string) => {
    await fetch('/api/admin/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid })
    });
    fetch('/api/admin/list-users')
      .then(res => res.json())
      .then(data => setUsuarios(data.users || []));
  };

  // Função para carregar conteúdo de aprofundamento
  async function carregarAprofundamento(sub: string) {
    setSubtopicoAprof(sub);
    setMsgAprof('');
    setConteudoAprof('');
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      const ref = doc(db, 'subtopics', sub);
      const snap = await getDoc(ref);
      if (snap.exists()) setConteudoAprof(snap.data().extraContent || '');
      else setConteudoAprof('');
    } catch (e) {
      setMsgAprof('Erro ao carregar conteúdo.');
    }
  }

  // Função para salvar conteúdo de aprofundamento
  async function salvarAprofundamento() {
    setSalvandoAprof(true);
    setMsgAprof('');
    try {
      if (!subtopicoAprof || !conteudoAprof) {
        setMsgAprof('Selecione um subtópico e preencha o conteúdo.');
        setSalvandoAprof(false);
        return;
      }
      const docId = subtopicoAprof.replace(/[^a-zA-Z0-9_-]/g, '_');
      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      await setDoc(doc(db, 'subtopics', docId), {
        name: subtopicoAprof,
        extraContent: conteudoAprof,
        updated_at: new Date().toISOString()
      }, { merge: true });
      setMsgAprof('Conteúdo salvo com sucesso!');
    } catch (e: any) {
      setMsgAprof('Erro ao salvar conteúdo: ' + (e.message || e.toString()));
      console.error('Erro ao salvar aprofundamento:', e);
    }
    setSalvandoAprof(false);
  }

  // Toolbar completa para o ReactQuill
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      ['clean'],
      [{ 'direction': 'rtl' }],
      [{ 'script': 'sub' }, { 'script': 'super' }]
    ]
  };

  if (!autenticado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Painel do Admin</h2>
            <p className="text-gray-600 mt-2">Faça login para acessar o painel</p>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">Email</label>
            <input 
              type="email" 
              value={login} 
              onChange={e => setLogin(e.target.value)} 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              placeholder="claudioghabryel7@gmail.com"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2 font-medium">Senha</label>
            <input 
              type="password" 
              value={senha} 
              onChange={e => setSenha(e.target.value)} 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              placeholder="Digite sua senha"
            />
          </div>
          {erro && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{erro}</div>}
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Entrar no Painel
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <Settings className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Painel do Admin</h1>
                <p className="text-sm text-gray-500">FlashConCards</p>
              </div>
            </div>
            <button 
              onClick={() => setAutenticado(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('flashcards')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'flashcards'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Flashcards
            </button>
            <button
              onClick={() => setActiveTab('aprofundamento')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'aprofundamento'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-2" />
              Aprofundamento
            </button>
            <button
              onClick={() => setActiveTab('usuarios')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'usuarios'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Usuários
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Flashcards Tab */}
        {activeTab === 'flashcards' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Gerenciar Flashcards</h2>
              <p className="text-sm text-gray-600 mt-1">Adicione e gerencie flashcards por matéria</p>
            </div>
            
            <div className="p-6">
              {/* Seleção de Matéria */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preparatório</label>
                  <select 
                    value={preparatorio} 
                    onChange={e => setPreparatorio(e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ALEGO">ALEGO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Matéria</label>
                  <select 
                    value={materia} 
                    onChange={e => setMateria(e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione a matéria</option>
                    {conteudoProgramatico.map((m: any) => (
                      <option key={m.titulo} value={m.titulo}>{m.titulo}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Formulário de Adição */}
              {materia && (
                <form onSubmit={handleAddFlashcard} className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-md font-semibold text-gray-900 mb-4">Adicionar Novo Flashcard</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subtópico</label>
                      <select 
                        value={subtopico} 
                        onChange={e => setSubtopico(e.target.value)} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Selecione o subtópico</option>
                        {subtitulos.map((sub: string, idx: number) => (
                          <option key={idx} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pergunta</label>
                      <input 
                        type="text" 
                        value={novaPergunta} 
                        onChange={e => setNovaPergunta(e.target.value)} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        placeholder="Digite a pergunta"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Resposta</label>
                      <input 
                        type="text" 
                        value={novaResposta} 
                        onChange={e => setNovaResposta(e.target.value)} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        placeholder="Digite a resposta"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button 
                      type="submit" 
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Flashcard
                    </button>
                  </div>
                </form>
              )}

              {/* Lista de Flashcards */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-4">Flashcards Cadastrados</h3>
                {carregando ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Carregando flashcards...</p>
                  </div>
                ) : (
                  <div>
                    {Object.keys(flashcardsPorSubtopico).length > 0 ? (
                      <div className="space-y-6">
                        {Object.keys(flashcardsPorSubtopico).map(sub => (
                          <div key={sub} className="border border-gray-200 rounded-lg">
                            <div className="bg-gray-50 px-4 py-3 border-b">
                              <h4 className="font-semibold text-gray-900">{sub}</h4>
                              <p className="text-sm text-gray-600">{flashcardsPorSubtopico[sub].length} flashcards</p>
                            </div>
                            <div className="p-4">
                              <div className="space-y-3">
                                {flashcardsPorSubtopico[sub].map(fc => (
                                  <div key={fc.id} className="flex items-start justify-between bg-white border border-gray-200 rounded-lg p-4">
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-900 mb-1">Q: {fc.question}</p>
                                      <p className="text-gray-600">A: {fc.answer}</p>
                                    </div>
                                    <button 
                                      onClick={() => handleDelete(fc.id)} 
                                      className="ml-4 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Nenhum flashcard cadastrado.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Aprofundamento Tab */}
        {activeTab === 'aprofundamento' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Conteúdo de Aprofundamento</h2>
              <p className="text-sm text-gray-600 mt-1">Crie conteúdo rico para aprofundar nos subtópicos</p>
            </div>
            
            <div className="p-6">
              {/* Seleção de Matéria */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Selecione a Matéria</label>
                <select 
                  value={materia} 
                  onChange={e => setMateria(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione a matéria</option>
                  {conteudoProgramatico.map((m: any) => (
                    <option key={m.titulo} value={m.titulo}>{m.titulo}</option>
                  ))}
                </select>
              </div>

              {materia && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Lista de Subtópicos */}
                  <div className="lg:col-span-1">
                    <h3 className="text-md font-semibold text-gray-900 mb-4">Subtópicos Disponíveis</h3>
                    <div className="space-y-2">
                      {subtopicosUnicos.map((sub: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => carregarAprofundamento(sub)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            subtopicoAprof === sub
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <span className="font-medium">{sub}</span>
                          {subtopicosSalvos.find(s => s.name === sub) && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Salvo
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Editor */}
                  <div className="lg:col-span-2">
                    <h3 className="text-md font-semibold text-gray-900 mb-4">Editor de Conteúdo</h3>
                    {subtopicoAprof ? (
                      <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Editando: {subtopicoAprof}</h4>
                          <p className="text-sm text-gray-600">Use o editor abaixo para criar conteúdo rico com formatação</p>
                        </div>
                        
                        <div className="border border-gray-300 rounded-lg">
                          <ReactQuill 
                            theme="snow" 
                            value={conteudoAprof} 
                            onChange={setConteudoAprof} 
                            modules={quillModules}
                            className="bg-white"
                            placeholder="Digite o conteúdo de aprofundamento aqui..."
                          />
                        </div>

                        <div className="flex justify-between items-center">
                          <button 
                            onClick={salvarAprofundamento} 
                            disabled={salvandoAprof}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                          >
                            {salvandoAprof ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Salvando...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-2" />
                                Salvar Conteúdo
                              </>
                            )}
                          </button>
                          
                          {msgAprof && (
                            <div className={`px-4 py-2 rounded-lg text-sm ${
                              msgAprof.includes('sucesso') 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {msgAprof}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Selecione um subtópico para começar a editar</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Lista de Conteúdos Salvos */}
              {materia && subtopicosSalvos.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-md font-semibold text-gray-900 mb-4">Conteúdos Salvos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.keys(subtopicosPorMateria).map(materia => (
                      <div key={materia} className="border border-gray-200 rounded-lg">
                        <div className="bg-gray-50 px-4 py-3 border-b">
                          <h4 className="font-semibold text-gray-900">{materia}</h4>
                        </div>
                        <div className="p-4">
                          <div className="space-y-2">
                            {subtopicosPorMateria[materia].map(sub => (
                              <div key={sub.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2">
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{sub.name}</p>
                                  <p className="text-xs text-gray-500">
                                    Salvo em: {new Date(sub.updated_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <button 
                                  onClick={() => carregarAprofundamento(sub.name)} 
                                  className="ml-2 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Usuários Tab */}
        {activeTab === 'usuarios' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Gerenciar Usuários</h2>
              <p className="text-sm text-gray-600 mt-1">Adicione e gerencie usuários do sistema</p>
            </div>
            
            <div className="p-6">
              {/* Formulário de Adição */}
              <form onSubmit={handleAddUser} className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-md font-semibold text-gray-900 mb-4">Adicionar Novo Usuário</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input 
                      type="email" 
                      value={novoEmail} 
                      onChange={e => setNovoEmail(e.target.value)} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      placeholder="usuario@exemplo.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                    <input 
                      type="password" 
                      value={novaSenha} 
                      onChange={e => setNovaSenha(e.target.value)} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      placeholder="Digite a senha"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button 
                    type="submit" 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Usuário
                  </button>
                </div>
              </form>

              {/* Lista de Usuários */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-4">Usuários Cadastrados</h3>
                {carregandoUsuarios ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Carregando usuários...</p>
                  </div>
                ) : (
                  <div>
                    {usuarios.length > 0 ? (
                      <div className="space-y-3">
                        {usuarios.map(u => (
                          <div key={u.uid} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4">
                            <div>
                              <p className="font-medium text-gray-900">{u.email}</p>
                              <p className="text-sm text-gray-500">UID: {u.uid}</p>
                            </div>
                            <button 
                              onClick={() => handleDeleteUser(u.uid)} 
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Nenhum usuário cadastrado.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 