'use client';

import React, { useState, useEffect } from 'react';

// Importação direta do React Quill
const ReactQuill = React.lazy(() => import('react-quill'));

import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Digite o conteúdo aqui...",
  className = ""
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'indent',
    'align',
    'link', 'image'
  ];

  if (!isClient) {
    return (
      <div className={`${className} h-48 bg-gray-100 animate-pulse rounded border border-gray-300 p-4`}>
        Carregando editor...
      </div>
    );
  }

  return (
    <div className={className}>
      <React.Suspense fallback={
        <div className="h-48 bg-gray-100 animate-pulse rounded border border-gray-300 p-4">
          Carregando editor...
        </div>
      }>
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          style={{ height: '300px' }}
        />
      </React.Suspense>
    </div>
  );
};

export default RichTextEditor; 