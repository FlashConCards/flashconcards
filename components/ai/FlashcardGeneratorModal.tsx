'use client';

import { useState } from 'react';
import { XMarkIcon, SparklesIcon, CogIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface FlashcardGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  subTopicId: string;
  subTopicName: string;
  content: string;
  onGenerate: (flashcards: any[]) => void;
}

export default function FlashcardGeneratorModal({ 
  isOpen, 
  onClose, 
  subTopicId, 
  subTopicName,
  content,
  onGenerate 
}: FlashcardGeneratorModalProps) {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    quantity: 5,
    difficulty: 'medium',
    examBoard: 'geral',
    questionType: 'mixed',
    focusAreas: [] as string[]
  });

  const difficultyOptions = [
    { value: 'easy', label: 'Fácil', description: 'Conceitos básicos e definições' },
    { value: 'medium', label: 'Médio', description: 'Aplicação prática de conceitos' },
    { value: 'hard', label: 'Difícil', description: 'Análise crítica e casos complexos' }
  ];

  const examBoardOptions = [
    { value: 'geral', label: 'Geral' },
    { value: 'cespe', label: 'CESPE/CEBRASPE' },
    { value: 'fgv', label: 'FGV' },
    { value: 'fcc', label: 'FCC' },
    { value: 'vunesp', label: 'VUNESP' },
    { value: 'aocp', label: 'AOCP' }
  ];

  const questionTypeOptions = [
    { value: 'mixed', label: 'Misto', description: 'Vários tipos de questões' },
    { value: 'objective', label: 'Objetivas', description: 'Pergunta e resposta direta' },
    { value: 'truefalse', label: 'Verdadeiro/Falso', description: 'Afirmações para julgar' },
    { value: 'complete', label: 'Complete', description: 'Preencher lacunas' },
    { value: 'multiple', label: 'Múltipla Escolha', description: 'Questões com alternativas' }
  ];

  const handleGenerate = async () => {
    try {
      setLoading(true);
      
      // Chamar API real de IA
      const response = await fetch('/api/ai/generate-flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          subTopicName,
          settings
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Formatar flashcards para o formato esperado
      const formattedFlashcards = data.flashcards.map((flashcard: any, index: number) => ({
        ...flashcard,
        subTopicId,
        order: index + 1,
        isActive: true,
        aiGenerated: true,
        difficulty: settings.difficulty,
        examBoard: settings.examBoard,
        questionType: settings.questionType
      }));
      
      onGenerate(formattedFlashcards);
      toast.success(`${formattedFlashcards.length} flashcards gerados com sucesso!`);
      onClose();
      
    } catch (error: any) {
      console.error('Erro ao gerar flashcards:', error);
      toast.error(`Erro ao gerar flashcards: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <SparklesIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">IA Geradora de Flashcards</h2>
              <p className="text-sm text-gray-600">Subtópico: {subTopicName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quantidade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantidade de Flashcards
            </label>
            <select
              value={settings.quantity}
              onChange={(e) => setSettings({...settings, quantity: parseInt(e.target.value)})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value={3}>3 flashcards</option>
              <option value={5}>5 flashcards</option>
              <option value={10}>10 flashcards</option>
              <option value={15}>15 flashcards</option>
              <option value={20}>20 flashcards</option>
            </select>
          </div>

          {/* Dificuldade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Nível de Dificuldade
            </label>
            <div className="grid grid-cols-1 gap-3">
              {difficultyOptions.map((option) => (
                <label key={option.value} className="cursor-pointer">
                  <div className={`p-4 border-2 rounded-lg transition-all ${
                    settings.difficulty === option.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="difficulty"
                        value={option.value}
                        checked={settings.difficulty === option.value}
                        onChange={(e) => setSettings({...settings, difficulty: e.target.value})}
                        className="mr-3 text-purple-600 focus:ring-purple-500"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-600">{option.description}</div>
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Estilo da Banca */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estilo da Banca
            </label>
            <select
              value={settings.examBoard}
              onChange={(e) => setSettings({...settings, examBoard: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {examBoardOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de Questão */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Questão
            </label>
            <select
              value={settings.questionType}
              onChange={(e) => setSettings({...settings, questionType: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {questionTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.description}
                </option>
              ))}
            </select>
          </div>

          {/* Aviso sobre IA */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CogIcon className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Como funciona:</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• A IA analisa o conteúdo do aprofundamento</li>
                  <li>• Gera flashcards baseados nas suas preferências</li>
                  <li>• Você pode editar os flashcards após a geração</li>
                  <li>• Os flashcards são salvos automaticamente</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <SparklesIcon className="w-4 h-4" />
            <span>{loading ? 'Gerando...' : 'Gerar Flashcards'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
