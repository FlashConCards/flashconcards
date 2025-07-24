"use client";
import { useState, useEffect } from "react";
import conteudoProgramatico from '../../conteudo_programatico.json';
import { db, auth } from '../lib/firebase';
import { createUserWithEmailAndPassword, deleteUser, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, onSnapshot } from 'firebase/firestore';
import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

const ADMIN_EMAIL = "claudioghabryel7@gmail.com";

export default function AdminPage() {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [autenticado, setAutenticado] = useState(false);
  const [erro, setErro] = useState("");

  // Painel admin
  const [preparatorio, setPreparatorio] = useState("ALEGO");
  const [materia, setMateria] = useState("");
  const [subtopico, setSubtopico] = useState("");
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [novaPergunta, setNovaPergunta] = useState("");
  const [novaResposta, setNovaResposta] = useState("");
  const [carregando, setCarregando] = useState(false);

  // Login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Só permite login com o e-mail do admin, mas o campo é rotulado como CPF
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

  // Subtópicos da matéria selecionada
  const subtitulos = materia ? (conteudoProgramatico.find((m: any) => m.titulo === materia)?.topicos || []) : [];

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

  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [novoEmail, setNovoEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [carregandoUsuarios, setCarregandoUsuarios] = useState(false);

  // Carregar lista de usuários em tempo real
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
    // Atualizar lista
    fetch('/api/admin/list-users')
      .then(res => res.json())
      .then(data => setUsuarios(data.users || []));
  };

  // Excluir usuário
  const handleDeleteUser = async (uid: string) => {
    await fetch('/api/admin/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid })
    });
    // Atualizar lista
    fetch('/api/admin/list-users')
      .then(res => res.json())
      .then(data => setUsuarios(data.users || []));
  };

  // Estado para editor de aprofundamento
  const [subtopicoAprof, setSubtopicoAprof] = useState('');
  const [conteudoAprof, setConteudoAprof] = useState('');
  const [salvandoAprof, setSalvandoAprof] = useState(false);
  const [msgAprof, setMsgAprof] = useState('');
  const [subtopicosSalvos, setSubtopicosSalvos] = useState<any[]>([]);

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

  // Combinar subtópicos do JSON com os salvos no Firestore
  const todosSubtopicos = [...subtitulos, ...subtopicosSalvos.map(s => s.name).filter(Boolean)];
  const subtopicosUnicos = Array.from(new Set(todosSubtopicos));

  // Agrupar subtópicos salvos por matéria
  const subtopicosPorMateria: Record<string, any[]> = {};
  subtopicosSalvos.forEach(sub => {
    // Tentar identificar a matéria baseado no nome do subtópico
    let materiaIdentificada = 'Outros';
    
    // Mapear subtópicos para matérias baseado no conteúdo programático
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
      // Validar nome do subtópico para ser um ID válido
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

  if (!autenticado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Painel do Admin</h2>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">CPF</label>
            <input type="text" value={login} onChange={e => setLogin(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Senha</label>
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {erro && <div className="mb-4 text-red-600 text-sm">{erro}</div>}
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">Entrar</button>
        </form>
      </div>
    );
  }

  if (autenticado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex flex-col items-center py-10">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 text-center">Painel do Admin</h2>
          {/* Seção de Cadastro de Flashcards */}
          <div className="mb-10 border-b pb-8">
            <h3 className="text-xl font-bold mb-4 text-blue-700">Cadastro de Flashcards</h3>
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Preparatório</label>
                <select value={preparatorio} onChange={e => setPreparatorio(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                  <option value="ALEGO">ALEGO</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Matéria</label>
                <select value={materia} onChange={e => setMateria(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                  <option value="">Selecione a matéria</option>
                  {conteudoProgramatico.map((m: any) => (
                    <option key={m.titulo} value={m.titulo}>{m.titulo}</option>
                  ))}
                </select>
              </div>
            </div>
            {materia && (
              <form onSubmit={handleAddFlashcard} className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">Subtópico</label>
                  <select value={subtopico} onChange={e => setSubtopico(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                    <option value="">Selecione o subtópico</option>
                    {subtitulos.map((sub: string, idx: number) => (
                      <option key={idx} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Pergunta</label>
                  <input type="text" value={novaPergunta} onChange={e => setNovaPergunta(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-1">Resposta</label>
                  <input type="text" value={novaResposta} onChange={e => setNovaResposta(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <button type="submit" className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors">Adicionar Flashcard</button>
                </div>
              </form>
            )}
            {/* Seção de Aprofundamento dos Subtópicos */}
            {materia && (
              <div className="mb-10 border-b pb-8">
                <h3 className="text-xl font-bold mb-4 text-blue-700">Aprofundamento dos Subtópicos</h3>
                <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Selecione o Subtópico</label>
                    <select value={subtopicoAprof} onChange={e => { carregarAprofundamento(e.target.value); }} className="w-full px-3 py-2 border rounded-lg">
                      <option value="">Selecione o subtópico</option>
                      {subtopicosUnicos.map((sub: string, idx: number) => (
                        <option key={idx} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {subtopicoAprof && (
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Conteúdo de Aprofundamento</label>
                    <ReactQuill theme="snow" value={conteudoAprof} onChange={setConteudoAprof} className="bg-white" modules={quillModules} />
                    <button onClick={salvarAprofundamento} disabled={salvandoAprof} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                      {salvandoAprof ? 'Salvando...' : 'Salvar Conteúdo'}
                    </button>
                    {msgAprof && <div className="mt-2 text-sm text-blue-700">{msgAprof}</div>}
                  </div>
                )}
              </div>
            )}
            {/* Lista de Subtópicos Salvos Organizados por Matéria */}
            <h4 className="text-lg font-bold mb-2 mt-6">Subtópicos com Aprofundamento</h4>
            <div className="mb-6">
              {subtopicosSalvos.length > 0 ? (
                <div>
                  {Object.keys(subtopicosPorMateria).map(materia => (
                    <div key={materia} className="mb-4">
                      <div className="font-semibold text-blue-700 mb-2 text-lg">{materia}</div>
                      <div className="space-y-2">
                        {subtopicosPorMateria[materia].map(sub => (
                          <div key={sub.id} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                            <div>
                              <span className="font-semibold text-green-700">{sub.name}</span>
                              <span className="text-sm text-gray-500 ml-2">(Salvo em: {new Date(sub.updated_at).toLocaleDateString()})</span>
                            </div>
                            <button 
                              onClick={() => carregarAprofundamento(sub.name)} 
                              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                            >
                              Editar
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">Nenhum subtópico com aprofundamento salvo.</div>
              )}
            </div>
            <h4 className="text-lg font-bold mb-2 mt-6">Flashcards cadastrados</h4>
            {carregando ? (
              <div>Carregando...</div>
            ) : (
              <div>
                {Object.keys(flashcardsPorSubtopico).length > 0 ? (
                  <div>
                    {Object.keys(flashcardsPorSubtopico).map(sub => (
                      <div key={sub} className="mb-4">
                        <div className="font-semibold text-blue-700 mb-2 text-lg">{sub}</div>
                        <ul className="space-y-2">
                          {flashcardsPorSubtopico[sub].map(fc => (
                            <li key={fc.id} className="flex flex-col md:flex-row md:items-center md:justify-between bg-gray-100 rounded-lg px-4 py-2">
                              <div className="mb-2 md:mb-0">
                                <span className="font-semibold">Q:</span> {fc.question}<br />
                                <span className="font-semibold">A:</span> {fc.answer}
                              </div>
                              <button onClick={() => handleDelete(fc.id)} className="ml-0 md:ml-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700 mt-2 md:mt-0">Remover</button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500">Nenhum flashcard cadastrado.</div>
                )}
              </div>
            )}
          </div>
          {/* Seção de Gerenciamento de Usuários */}
          <div className="mt-10">
            <h3 className="text-xl font-bold mb-4 text-blue-700">Gerenciar Usuários</h3>
            <form onSubmit={handleAddUser} className="flex flex-col md:flex-row gap-2 mb-4">
              <input type="email" placeholder="Novo e-mail" value={novoEmail} onChange={e => setNovoEmail(e.target.value)} className="px-3 py-2 border rounded-lg w-full md:w-auto" />
              <input type="password" placeholder="Senha" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} className="px-3 py-2 border rounded-lg w-full md:w-auto" />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">Adicionar</button>
            </form>
            {carregandoUsuarios ? (
              <div>Carregando usuários...</div>
            ) : (
              <ul className="space-y-2">
                {usuarios.map(u => (
                  <li key={u.uid} className="flex flex-col md:flex-row md:items-center md:justify-between bg-gray-100 rounded-lg px-4 py-2">
                    <span>{u.email}</span>
                    <button onClick={() => handleDeleteUser(u.uid)} className="ml-0 md:ml-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700 mt-2 md:mt-0">Excluir</button>
                  </li>
                ))}
                {usuarios.length === 0 && <li className="text-gray-500">Nenhum usuário cadastrado.</li>}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }
} 