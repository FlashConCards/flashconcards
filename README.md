# FlashConCards - Plataforma de Flashcards

Uma plataforma moderna para criação e estudo de flashcards, desenvolvida com Next.js, TypeScript, Tailwind CSS e Firebase.

## 🚀 Tecnologias

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Firebase** - Backend e autenticação
- **Mercado Pago** - Processamento de pagamentos
- **Vercel** - Deploy

## 📋 Funcionalidades

- ✅ Autenticação de usuários
- ✅ Criação e estudo de flashcards
- ✅ Sistema de repetição espaçada
- ✅ Pagamentos via Mercado Pago
- ✅ Painel administrativo
- ✅ Depoimentos de usuários
- ✅ Progresso de estudo
- ✅ Múltiplos cursos e matérias

## 🛠️ Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/FlashConCards/flashconcards.git
cd flashconcards
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp env.example .env.local
```

Edite o arquivo `.env.local` com suas configurações:
```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id

# Mercado Pago
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=sua_public_key
MERCADOPAGO_ACCESS_TOKEN=seu_access_token
MERCADOPAGO_WEBHOOK_SECRET=seu_webhook_secret
```

4. **Execute o projeto**
```bash
npm run dev
```

## 🔥 Configuração do Firebase

### 1. Configurar Autenticação
- Vá para o console do Firebase
- Acesse **Authentication** > **Settings** > **Authorized domains**
- Adicione: `flashconcards.vercel.app`

### 2. Configurar Firestore Security Rules
No console do Firebase, vá para **Firestore Database** > **Rules** e substitua por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir acesso total para desenvolvimento
    match /{document=**} {
      allow read, write: if true;
    }
    
    // Regras específicas para cada coleção
    match /users/{userId} {
      allow read, write: if true;
    }
    
    match /admin-users/{userId} {
      allow read, write: if true;
    }
    
    match /testimonials/{testimonialId} {
      allow read, write: if true;
    }
    
    match /courses/{courseId} {
      allow read, write: if true;
    }
    
    match /subjects/{subjectId} {
      allow read, write: if true;
    }
    
    match /topics/{topicId} {
      allow read, write: if true;
    }
    
    match /subtopics/{subtopicId} {
      allow read, write: if true;
    }
    
    match /flashcards/{flashcardId} {
      allow read, write: if true;
    }
    
    match /deepenings/{deepeningId} {
      allow read, write: if true;
    }
    
    match /study-sessions/{sessionId} {
      allow read, write: if true;
    }
    
    match /payments/{paymentId} {
      allow read, write: if true;
    }
    
    match /cards/{cardId} {
      allow read, write: if true;
    }
  }
}
```

### 3. Configurar Storage Rules
No console do Firebase, vá para **Storage** > **Rules** e substitua por:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

## 📱 Deploy

O projeto está configurado para deploy automático no Vercel:

1. Conecte seu repositório GitHub ao Vercel
2. Configure as variáveis de ambiente no Vercel
3. O deploy será automático a cada push

## 🎯 Estrutura do Projeto

```
FlashConCards/
├── app/                    # Páginas Next.js 14
│   ├── admin/             # Painel administrativo
│   ├── api/               # API routes
│   ├── courses/           # Página de cursos
│   ├── dashboard/         # Dashboard do usuário
│   └── ...
├── components/            # Componentes React
├── lib/                  # Utilitários e configurações
├── types/                # Definições TypeScript
└── public/               # Arquivos estáticos
```

## 🔐 Autenticação

O sistema usa Firebase Authentication com os seguintes provedores:
- Email/Senha
- Google (configurável)

## 💳 Pagamentos

Integração com Mercado Pago para:
- Pagamentos únicos
- Assinaturas recorrentes
- Webhooks para confirmação

## 📊 Painel Administrativo

Acessível em `/admin` para usuários com permissão de administrador.

**Emails com acesso admin:**
- `claudioghabryel.cg@gmail.com`
- `natalhia775@gmail.com`
- `claudioghabryel7@gmail.com`

## 🚀 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Linting
```

## 📄 Licença

Este projeto está sob a licença MIT.