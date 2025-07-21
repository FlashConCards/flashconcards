"use client";
import { useState, useEffect } from "react";
import conteudoProgramatico from '../../conteudo_programatico.json';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, onSnapshot } from 'firebase/firestore';

const LOGIN = "70389409103";
const SENHA = "Gabriel@123";

export default function AdminPage() {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [autenticado, setAutenticado] = useState(false);
  const [erro, setErro] = useState("");

  // Painel admin
  const [preparatorio, setPreparatorio] = useState("ALEGO");
  const [materia, setMateria] = useState("");
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [novaPergunta, setNovaPergunta] = useState("");
  const [novaResposta, setNovaResposta] = useState("");
  const [carregando, setCarregando] = useState(false);

  // Login
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login === LOGIN && senha === SENHA) {
      setAutenticado(true);
      setErro("");
    } else {
      setErro("Login ou senha incorretos.");
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

  // Adicionar flashcard
  const handleAddFlashcard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaPergunta.trim() || !novaResposta.trim()) return;
    await addDoc(collection(db, 'flashcards'), {
      preparatorio,
      subject: materia,
      question: novaPergunta,
      answer: novaResposta,
      created_at: new Date().toISOString(),
    });
    setNovaPergunta("");
    setNovaResposta("");
  };

  // Remover flashcard
  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'flashcards', id));
  };

  if (!autenticado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Painel do Admin</h2>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Login (CPF)</label>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex flex-col items-center py-10">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 text-center">Painel do Admin</h2>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Preparatório</label>
          <select value={preparatorio} onChange={e => setPreparatorio(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
            <option value="ALEGO">ALEGO</option>
            {/* Futuramente, adicionar outros preparatórios aqui */}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Matéria</label>
          <select value={materia} onChange={e => setMateria(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
            <option value="">Selecione a matéria</option>
            {conteudoProgramatico.map((m: any) => (
              <option key={m.titulo} value={m.titulo}>{m.titulo}</option>
            ))}
          </select>
        </div>
        {materia && (
          <>
            <form onSubmit={handleAddFlashcard} className="mb-6">
              <div className="mb-2">
                <label className="block text-gray-700 mb-1">Pergunta</label>
                <input type="text" value={novaPergunta} onChange={e => setNovaPergunta(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="mb-2">
                <label className="block text-gray-700 mb-1">Resposta</label>
                <input type="text" value={novaResposta} onChange={e => setNovaResposta(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <button type="submit" className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors">Adicionar Flashcard</button>
            </form>
            <h3 className="text-lg font-bold mb-2">Flashcards cadastrados</h3>
            {carregando ? (
              <div>Carregando...</div>
            ) : (
              <ul className="space-y-2">
                {flashcards.map(fc => (
                  <li key={fc.id} className="flex items-center justify-between bg-gray-100 rounded-lg px-4 py-2">
                    <div>
                      <span className="font-semibold">Q:</span> {fc.question}<br />
                      <span className="font-semibold">A:</span> {fc.answer}
                    </div>
                    <button onClick={() => handleDelete(fc.id)} className="ml-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700">Remover</button>
                  </li>
                ))}
                {flashcards.length === 0 && <li className="text-gray-500">Nenhum flashcard cadastrado.</li>}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
} 