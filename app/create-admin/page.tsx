"use client";
import { useState } from 'react';

export default function CreateAdminPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const createAdmin = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/admin/create-admin-user', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ ${data.message}`);
      } else {
        setMessage(`❌ Erro: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Erro ao criar usuário: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">
          Criar Usuário Admin
        </h1>
        
        <div className="mb-4 text-sm text-gray-600">
          <p><strong>Email:</strong> claudioghabryel7@gmail.com</p>
          <p><strong>Senha:</strong> Gabriel@123</p>
        </div>

        <button
          onClick={createAdmin}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Criando...' : 'Criar Usuário Admin'}
        </button>

        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <div className="mt-6 text-xs text-gray-500">
          <p>⚠️ Esta página é temporária. Após criar o usuário, você pode acessar o admin em:</p>
          <p className="mt-2 font-mono bg-gray-100 p-2 rounded">
            /admin
          </p>
        </div>
      </div>
    </div>
  );
} 