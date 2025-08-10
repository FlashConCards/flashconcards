import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { content, subTopicName, settings } = await request.json();

    // Validar dados de entrada
    if (!content || !subTopicName || !settings) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      );
    }

    // Construir prompt para a IA
    const prompt = buildPrompt(content, subTopicName, settings);
    
    // Chamar API da OpenAI (ou Claude se preferir)
    const flashcards = await generateWithOpenAI(prompt, settings.quantity);
    
    return NextResponse.json({ flashcards });
    
  } catch (error) {
    console.error('Erro ao gerar flashcards:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

function buildPrompt(content: string, subTopicName: string, settings: any): string {
  const difficultyMap = {
    easy: 'básicos e definições simples',
    medium: 'aplicação prática de conceitos',
    hard: 'análise crítica e casos complexos'
  };

  const questionTypeMap = {
    objective: 'pergunta direta com resposta objetiva',
    truefalse: 'afirmações para julgar como verdadeiro ou falso',
    complete: 'frases para completar com palavras-chave',
    multiple: 'questões de múltipla escolha com 4 alternativas',
    mixed: 'mistura de todos os tipos acima'
  };

  return `
Você é um especialista em criar flashcards educacionais para concursos públicos.

CONTEXTO:
- Subtópico: ${subTopicName}
- Conteúdo: ${content}

REQUISITOS:
- Quantidade: ${settings.quantity} flashcards
- Dificuldade: ${difficultyMap[settings.difficulty as keyof typeof difficultyMap]}
- Tipo: ${questionTypeMap[settings.questionType as keyof typeof questionTypeMap]}

INSTRUÇÕES:
1. Analise o conteúdo fornecido
2. Identifique os conceitos mais importantes
3. Crie flashcards variados e relevantes
4. Use linguagem clara e objetiva
5. Inclua explicações úteis

FORMATO DE RESPOSTA (JSON):
[
  {
    "front": "Pergunta ou conceito",
    "back": "Resposta direta e clara",
    "explanation": "Explicação detalhada para ajudar no aprendizado"
  }
]

IMPORTANTE:
- Retorne APENAS o JSON válido
- Não inclua texto adicional
- Certifique-se de que o JSON está bem formatado
- Cada flashcard deve ser único e relevante
- Foque em conceitos que realmente aparecem no conteúdo fornecido
`;
}

async function generateWithOpenAI(prompt: string, quantity: number) {
  try {
    // Se não tiver API key, usar mock para desenvolvimento
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      console.log('OPENAI_API_KEY não configurada, usando mock');
      return generateMockFlashcards(quantity);
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em criar flashcards educacionais. Sempre retorne JSON válido.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Resposta vazia da OpenAI');
    }

    // Tentar fazer parse do JSON
    try {
      const flashcards = JSON.parse(content);
      return flashcards;
    } catch (parseError) {
      console.error('Erro ao fazer parse da resposta da IA:', parseError);
      console.log('Resposta recebida:', content);
      // Fallback para mock se o parse falhar
      return generateMockFlashcards(quantity);
    }

  } catch (error) {
    console.error('Erro na API da OpenAI:', error);
    // Fallback para mock em caso de erro
    return generateMockFlashcards(quantity);
  }
}

function generateMockFlashcards(quantity: number) {
  const mockFlashcards = [];
  
  for (let i = 0; i < quantity; i++) {
    mockFlashcards.push({
      front: `Conceito importante ${i + 1} sobre o tema estudado`,
      back: `Resposta detalhada para o conceito ${i + 1}`,
      explanation: `Explicação completa para ajudar no entendimento do conceito ${i + 1}`
    });
  }
  
  return mockFlashcards;
}
