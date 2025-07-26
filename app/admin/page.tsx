"use client";
import { useState, useEffect } from "react";
import conteudoProgramatico from '../../conteudo_programatico.json';
import { db, auth } from '../lib/firebase';
import { createUserWithEmailAndPassword, deleteUser, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, onSnapshot, setDoc } from 'firebase/firestore';
import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';
import { BookOpen, Users, FileText, Settings, LogOut, Plus, Edit, Trash2, CheckCircle } from 'lucide-react';

const ADMIN_EMAIL = "claudioghabryel7@gmail.com";

export default function AdminPage() {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [autenticado, setAutenticado] = useState(false);
  const [erro, setErro] = useState("");
  const [activeTab, setActiveTab] = useState('flashcards');

  // Estados para flashcards
  const [preparatorio, setPreparatorio] = useState("ALEGO");
  const [materia, setMateria] = useState("");
  const [subtopico, setSubtopico] = useState("");
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [novaPergunta, setNovaPergunta] = useState("");
  const [novaResposta, setNovaResposta] = useState("");
  const [carregando, setCarregando] = useState(false);

  // Estados para usuários
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [carregandoUsuarios, setCarregandoUsuarios] = useState(false);
  const [novoEmail, setNovoEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");

  // Estados para aprofundamento
  const [subtopicoAprof, setSubtopicoAprof] = useState('');
  const [conteudoAprof, setConteudoAprof] = useState('');
  const [salvandoAprof, setSalvandoAprof] = useState(false);
  const [msgAprof, setMsgAprof] = useState('');
  const [subtopicosSalvos, setSubtopicosSalvos] = useState<any[]>([]);

  // Login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (login.trim().toLowerCase() !== ADMIN_EMAIL) {
      setErro("Acesso negado. CPF ou senha incorretos.");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, login, senha);
      setAutenticado(true);
      setErro("");
    } catch (err) {
      setErro("Acesso negado. CPF ou senha incorretos.");
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

  // Carregar usuários
  useEffect(() => {
    if (!autenticado) return;
    setCarregandoUsuarios(true);
    const q = query(collection(db, 'users'));
    const unsub = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ 
        uid: doc.id, 
        ...doc.data() 
      }));
      setUsuarios(users);
      setCarregandoUsuarios(false);
      console.log('Usuários carregados:', users);
    });
    return () => unsub();
  }, [autenticado]);

  // Carregar subtópicos salvos
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

  // Agrupar flashcards por subtópico
  const flashcardsPorSubtopico: Record<string, any[]> = {};
  flashcards.forEach(fc => {
    const key = fc.subtopico || "(Sem subtópico)";
    if (!flashcardsPorSubtopico[key]) flashcardsPorSubtopico[key] = [];
    flashcardsPorSubtopico[key].push(fc);
  });

  // Funções para flashcards
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

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'flashcards', id));
  };

  // Funções para usuários
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoEmail.trim() || !novaSenha.trim()) return;
    try {
      // Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, novoEmail, novaSenha);
      
      // Criar documento do usuário no Firestore com acesso pago
      const userId = userCredential.user.uid;
      const normalizedId = novoEmail.replace(/[^a-zA-Z0-9]/g, '_');
      
      // Usar setDoc com ID específico para garantir consistência
      await setDoc(doc(db, 'users', normalizedId), {
        uid: userId,
        email: novoEmail,
        name: novoEmail.split('@')[0],
        isPaid: true,
        hasAccess: true,
        created_at: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      });

      // Criar pagamento aprovado para o usuário
      await setDoc(doc(db, 'payments', `payment_${normalizedId}`), {
        email: novoEmail,
        uid: userId,
        payment_id: `admin_${Date.now()}`,
        amount: 99.90,
        status: 'approved',
        method: 'admin',
        created_at: new Date().toISOString()
      });

      console.log('✅ Usuário criado com acesso pago:', novoEmail);
      setNovoEmail("");
      setNovaSenha("");
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    try {
      // Deletar usuário do Firestore
      await deleteDoc(doc(db, 'users', uid));
      
      // Deletar pagamentos relacionados
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const paymentsQuery = query(collection(db, 'payments'), where('uid', '==', uid));
      const paymentsSnapshot = await getDocs(paymentsQuery);
      
      for (const paymentDoc of paymentsSnapshot.docs) {
        await deleteDoc(paymentDoc.ref);
      }
      
      console.log('✅ Usuário deletado com sucesso:', uid);
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
    }
  };

  // Funções para aprofundamento
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

  // Toolbar para ReactQuill
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      ['clean']
    ]
  };

  // Logout
  const handleLogout = () => {
    auth.signOut();
    setAutenticado(false);
  };

  if (!autenticado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm">
          <div className="text-center mb-6">
            <Settings className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Painel Administrativo</h2>
            <p className="text-gray-600 mt-2">Faça login para continuar</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">CPF</label>
              <input 
                type="text" 
                value={login} 
                onChange={e => setLogin(e.target.value)} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="Digite seu CPF"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Senha</label>
              <input 
                type="password" 
                value={senha} 
                onChange={e => setSenha(e.target.value)} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="Digite sua senha"
              />
            </div>
            {erro && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{erro}</div>}
            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Painel Administrativo</h1>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sair
            </button>
          </div>
        </div>
      </header>

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
              <BookOpen className="h-5 w-5 inline mr-2" />
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
              <FileText className="h-5 w-5 inline mr-2" />
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
              <Users className="h-5 w-5 inline mr-2" />
              Usuários
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Flashcards Tab */}
        {activeTab === 'flashcards' && (
          <div className="space-y-8">
            {/* Add Flashcard Form */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Plus className="h-5 w-5 mr-2 text-blue-600" />
                Adicionar Flashcard
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Preparatório</label>
                  <select 
                    value={preparatorio} 
                    onChange={e => setPreparatorio(e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALEGO">ALEGO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Matéria</label>
                  <select 
                    value={materia} 
                    onChange={e => setMateria(e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione a matéria</option>
                    {conteudoProgramatico.map((m: any) => (
                      <option key={m.titulo} value={m.titulo}>{m.titulo}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {materia && (
                <form onSubmit={handleAddFlashcard} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">Subtópico</label>
                      <select 
                        value={subtopico} 
                        onChange={e => setSubtopico(e.target.value)} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Selecione o subtópico</option>
                        {subtitulos.map((sub: string, idx: number) => (
                          <option key={idx} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">Pergunta</label>
                      <input 
                        type="text" 
                        value={novaPergunta} 
                        onChange={e => setNovaPergunta(e.target.value)} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Digite a pergunta"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Resposta</label>
                    <input 
                      type="text" 
                      value={novaResposta} 
                      onChange={e => setNovaResposta(e.target.value)} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Digite a resposta"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button 
                      type="submit" 
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Flashcard
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Flashcards List */}
            {materia && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                  Flashcards Cadastrados
                </h2>
                {carregando ? (
                  <div className="text-center py-8 text-gray-500">Carregando flashcards...</div>
                ) : (
                  <div>
                    {Object.keys(flashcardsPorSubtopico).length > 0 ? (
                      <div className="space-y-6">
                        {Object.keys(flashcardsPorSubtopico).map(sub => (
                          <div key={sub} className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-blue-700 mb-3 text-lg">{sub}</h3>
                            <div className="space-y-3">
                              {flashcardsPorSubtopico[sub].map(fc => (
                                <div key={fc.id} className="flex items-start justify-between bg-gray-50 rounded-lg p-4">
                                  <div className="flex-1">
                                    <div className="mb-2">
                                      <span className="font-semibold text-gray-700">P:</span> 
                                      <span className="ml-2">{fc.question}</span>
                                    </div>
                                    <div>
                                      <span className="font-semibold text-gray-700">R:</span> 
                                      <span className="ml-2">{fc.answer}</span>
                                    </div>
                                  </div>
                                  <button 
                                    onClick={() => handleDelete(fc.id)} 
                                    className="ml-4 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">Nenhum flashcard cadastrado para esta matéria.</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Aprofundamento Tab */}
        {activeTab === 'aprofundamento' && (
          <div className="space-y-8">
            {/* Add Aprofundamento Form */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Adicionar Conteúdo de Aprofundamento
              </h2>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-medium">Selecione o Subtópico</label>
                <select 
                  value={subtopicoAprof} 
                  onChange={e => carregarAprofundamento(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione o subtópico</option>
                  {subtopicosUnicos.map((sub: string, idx: number) => (
                    <option key={idx} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
              
              {subtopicoAprof && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Conteúdo de Aprofundamento</label>
                    <ReactQuill 
                      theme="snow" 
                      value={conteudoAprof} 
                      onChange={setConteudoAprof} 
                      className="bg-white" 
                      modules={quillModules} 
                    />
                  </div>
                  <div className="flex justify-end">
                    <button 
                      onClick={salvarAprofundamento} 
                      disabled={salvandoAprof} 
                      className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {salvandoAprof ? 'Salvando...' : 'Salvar Conteúdo'}
                    </button>
                  </div>
                  {msgAprof && (
                    <div className={`p-3 rounded-lg text-sm ${
                      msgAprof.includes('sucesso') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {msgAprof}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Aprofundamento List */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Conteúdos de Aprofundamento Salvos
              </h2>
              {subtopicosSalvos.length > 0 ? (
                <div className="space-y-6">
                  {Object.keys(subtopicosPorMateria).map(materia => (
                    <div key={materia} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-700 mb-3 text-lg">{materia}</h3>
                      <div className="space-y-3">
                        {subtopicosPorMateria[materia].map(sub => (
                          <div key={sub.id} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex-1">
                              <div className="font-semibold text-green-700">{sub.name}</div>
                              <div className="text-sm text-gray-500">
                                Salvo em: {new Date(sub.updated_at).toLocaleDateString()}
                              </div>
                            </div>
                            <button 
                              onClick={() => carregarAprofundamento(sub.name)} 
                              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">Nenhum conteúdo de aprofundamento salvo.</div>
              )}
            </div>
          </div>
        )}

        {/* Usuários Tab */}
        {activeTab === 'usuarios' && (
          <div className="space-y-8">
            {/* Add User Form */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Adicionar Usuário
              </h2>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">E-mail</label>
                    <input 
                      type="email" 
                      value={novoEmail} 
                      onChange={e => setNovoEmail(e.target.value)} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Digite o e-mail"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Senha</label>
                    <input 
                      type="password" 
                      value={novaSenha} 
                      onChange={e => setNovaSenha(e.target.value)} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Digite a senha"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button 
                    type="submit" 
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Usuário
                  </button>
                </div>
              </form>
            </div>

            {/* Users List */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Usuários Cadastrados
              </h2>
              {carregandoUsuarios ? (
                <div className="text-center py-8 text-gray-500">Carregando usuários...</div>
              ) : (
                <div className="space-y-3">
                  {usuarios.map(u => (
                    <div key={u.uid} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{u.email}</div>
                        <div className="text-sm text-gray-500">
                          Nome: {u.name || 'N/A'} | 
                          Acesso: {u.isPaid || u.hasAccess ? '✅ Pago' : '❌ Pendente'} |
                          Criado: {new Date(u.created_at).toLocaleDateString()}
                          {u.lastLogin && ` | Último login: ${new Date(u.lastLogin).toLocaleDateString()}`}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteUser(u.uid)} 
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </button>
                    </div>
                  ))}
                  {usuarios.length === 0 && (
                    <div className="text-center py-8 text-gray-500">Nenhum usuário cadastrado.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 