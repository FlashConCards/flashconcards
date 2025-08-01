'use client';

import { useState } from 'react';

export default function TestEmailPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [course, setCourse] = useState('Curso Teste');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const testEmail = async () => {
    setLoading(true);
    setResult('');

    try {
      const response = await fetch('/api/debug-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: email,
          userName: name,
          courseName: course
        })
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Erro: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const checkConfig = async () => {
    try {
      const response = await fetch('/api/debug-email');
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Erro: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">🧪 Teste de Email</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Seu Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="seu-email@gmail.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Seu Nome:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Seu Nome"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Curso:</label>
            <input
              type="text"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={checkConfig}
              className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              🔍 Verificar Configuração
            </button>
            
            <button
              onClick={testEmail}
              disabled={loading || !email || !name}
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? '📤 Enviando...' : '📧 Enviar Teste'}
            </button>
          </div>
        </div>

        {result && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Resultado:</h3>
            <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
              {result}
            </pre>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-600">
          <h3 className="font-medium mb-2">📋 Instruções:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Preencha seu email e nome</li>
            <li>Clique em "Verificar Configuração"</li>
            <li>Se estiver configurado, clique em "Enviar Teste"</li>
            <li>Verifique seu email (incluindo spam)</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 