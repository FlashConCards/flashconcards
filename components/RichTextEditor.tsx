'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Importação dinâmica do React Quill para evitar problemas de SSR
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => {
    console.log('ReactQuill loading...');
    return <div className="h-48 bg-gray-100 animate-pulse rounded border border-gray-300 p-4">Carregando editor...</div>
  }
});

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
  const [isLoaded, setIsLoaded] = useState(false);
  const [quillLoaded, setQuillLoaded] = useState(false);

  useEffect(() => {
    console.log('RichTextEditor mounted');
    setIsLoaded(true);
    
    // Verificar se o ReactQuill está disponível
    const checkQuill = async () => {
      try {
        const Quill = await import('react-quill');
        console.log('ReactQuill loaded successfully');
        setQuillLoaded(true);
      } catch (error) {
        console.error('Error loading ReactQuill:', error);
      }
    };
    
    checkQuill();
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

  console.log('RichTextEditor rendering, isLoaded:', isLoaded, 'quillLoaded:', quillLoaded);

  return (
    <div className={className}>
      {isLoaded && quillLoaded ? (
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          style={{ height: '300px' }}
        />
      ) : (
        <div className="h-48 bg-gray-100 animate-pulse rounded border border-gray-300 p-4">
          {quillLoaded ? 'Editor carregado!' : 'Carregando editor...'}
        </div>
      )}
    </div>
  );
};

export default RichTextEditor; 