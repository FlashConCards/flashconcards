"use client";
import { useState } from "react";

const LOGIN = "70389409103";
const SENHA = "Gabriel@123";

export default function AdminPage() {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [autenticado, setAutenticado] = useState(false);
  const [erro, setErro] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login === LOGIN && senha === SENHA) {
      setAutenticado(true);
      setErro("");
    } else {
      setErro("Login ou senha incorretos.");
    }
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Bem-vindo ao Painel do Admin</h2>
        <p className="text-gray-700 mb-4">Acesso liberado! Em breve, painel de gerenciamento de flashcards.</p>
      </div>
    </div>
  );
} 