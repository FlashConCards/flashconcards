# FlashConCards

Uma plataforma de flashcards para estudo eficiente.

## 🚀 Tecnologias

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Firebase** - Backend e autenticação
- **Mercado Pago** - Pagamentos

## 📁 Estrutura do Projeto

```
FlashConCards/
├── app/                    # Páginas Next.js
├── components/            # Componentes React
├── lib/                  # Utilitários (Firebase, etc.)
├── types/                # Tipos TypeScript
└── public/               # Arquivos estáticos
```

## 🔥 Firebase Configuration

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir acesso autenticado aos dados do usuário
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == userId || 
         request.auth.token.email == 'claudioghabryel.cg@gmail.com' || 
         request.auth.token.email == 'natalhia775@gmail.com' ||
         request.auth.token.email == 'claudioghabryel7@gmail.com');
    }
    
    // Permitir acesso autenticado aos cursos
    match /courses/{courseId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.token.email == 'claudioghabryel.cg@gmail.com' || 
         request.auth.token.email == 'natalhia775@gmail.com' ||
         request.auth.token.email == 'claudioghabryel7@gmail.com');
    }
    
    // Permitir acesso autenticado às matérias
    match /subjects/{subjectId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.token.email == 'claudioghabryel.cg@gmail.com' || 
         request.auth.token.email == 'natalhia775@gmail.com' ||
         request.auth.token.email == 'claudioghabryel7@gmail.com');
    }
    
    // Permitir acesso autenticado aos tópicos
    match /topics/{topicId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.token.email == 'claudioghabryel.cg@gmail.com' || 
         request.auth.token.email == 'natalhia775@gmail.com' ||
         request.auth.token.email == 'claudioghabryel7@gmail.com');
    }
    
    // Permitir acesso autenticado aos sub-tópicos
    match /subtopics/{subtopicId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.token.email == 'claudioghabryel.cg@gmail.com' || 
         request.auth.token.email == 'natalhia775@gmail.com' ||
         request.auth.token.email == 'claudioghabryel7@gmail.com');
    }
    
    // Permitir acesso autenticado aos flashcards
    match /flashcards/{flashcardId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.token.email == 'claudioghabryel.cg@gmail.com' || 
         request.auth.token.email == 'natalhia775@gmail.com' ||
         request.auth.token.email == 'claudioghabryel7@gmail.com');
    }
    
    // Permitir acesso autenticado aos aprofundamentos
    match /deepenings/{deepeningId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.token.email == 'claudioghabryel.cg@gmail.com' || 
         request.auth.token.email == 'natalhia775@gmail.com' ||
         request.auth.token.email == 'claudioghabryel7@gmail.com');
    }
    
    // Permitir acesso autenticado às sessões de estudo
    match /study-sessions/{sessionId} {
      allow read, write: if request.auth != null;
    }
    
    // Permitir acesso autenticado aos pagamentos
    match /payments/{paymentId} {
      allow read, write: if request.auth != null;
    }
    
    // Permitir acesso autenticado aos depoimentos
    match /testimonials/{testimonialId} {
      allow read: if true; // Qualquer one pode ler depoimentos aprovados
      allow write: if request.auth != null; // Apenas usuários autenticados podem criar
    }
  }
}
```

### Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🏃‍♂️ Como Executar

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/FlashConCards.git
cd FlashConCards
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp env.example .env.local
```

4. **Execute o projeto**
```bash
npm run dev
```

## 📋 Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run start` - Servidor de produção
- `npm run lint` - Verificar código

## 🌐 Deploy

O projeto está configurado para deploy automático no Vercel.

## 📞 Suporte

Para dúvidas ou problemas, entre em contato através do email: claudioghabryel.cg@gmail.com