"use client";
import { useState } from 'react';

export default function CreateAdminPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [debug, setDebug] = useState('');

  const createAdmin = async () => {
    setLoading(true);
    setMessage('');
    setDebug('');
    
    try {
      console.log('Iniciando criação do usuário admin...');
      setDebug('Iniciando criação do usuário admin...');
      
      const response = await fetch('/api/admin/create-admin-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Resposta recebida:', response.status);
      setDebug(`Resposta recebida: ${response.status}`);
      
      const data = await response.json();
      console.log('Dados recebidos:', data);
      setDebug(`Dados recebidos: ${JSON.stringify(data, null, 2)}`);
      
      if (data.success) {
        setMessage(`✅ ${data.message}`);
      } else {
        setMessage(`❌ Erro: ${data.error}`);
      }
    } catch (error) {
      console.error('Erro completo:', error);
      setMessage(`❌ Erro ao criar usuário: ${error}`);
      setDebug(`Erro completo: ${JSON.stringify(error, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">
          Criar Usuário Admin
        </h1>
        
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Credenciais do Admin:</h3>
          <p className="text-sm text-blue-700"><strong>Email:</strong> claudioghabryel7@gmail.com</p>
          <p className="text-sm text-blue-700"><strong>Senha:</strong> Gabriel@123</p>
        </div>

        <button
          onClick={createAdmin}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 mb-4"
        >
          {loading ? 'Criando usuário admin...' : 'Criar Usuário Admin'}
        </button>

        {message && (
          <div className={`mb-4 p-4 rounded-lg text-sm ${
            message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {debug && (
          <div className="mb-4 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Debug Info:</h3>
            <pre className="text-xs text-gray-700 whitespace-pre-wrap">{debug}</pre>
          </div>
        )}

        <div className="mt-6 text-xs text-gray-500">
          <p>⚠️ Esta página é temporária. Após criar o usuário com sucesso, você pode acessar o admin em:</p>
          <p className="mt-2 font-mono bg-gray-100 p-2 rounded">
            /admin
          </p>
          <p className="mt-2">Se ainda não funcionar, verifique o console do navegador (F12) para mais detalhes.</p>
        </div>
      </div>
    </div>
  );
} 