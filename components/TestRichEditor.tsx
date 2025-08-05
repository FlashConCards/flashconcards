'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div className="h-48 bg-gray-100 animate-pulse rounded border border-gray-300 p-4">Carregando editor...</div>
});

import 'react-quill/dist/quill.snow.css';

export default function TestRichEditor() {
  const [value, setValue] = useState('');

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Teste do Editor Rico</h2>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={setValue}
        placeholder="Digite aqui..."
        style={{ height: '200px' }}
      />
      <div className="mt-4">
        <h3>Conteúdo HTML:</h3>
        <pre className="bg-gray-100 p-2 rounded text-sm">{value}</pre>
      </div>
    </div>
  );
} 