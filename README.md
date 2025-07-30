# FlashConCards - Plataforma de Estudos para Concursos

Uma plataforma moderna de estudos para concursos públicos com flashcards inteligentes, sistema de aprofundamento e progresso em tempo real.

## 🚀 Tecnologias

- **Frontend:** Next.js 14, React, TypeScript, TailwindCSS
- **Backend:** Firebase (Authentication, Firestore, Storage)
- **Pagamentos:** Mercado Pago (PIX)
- **Deploy:** Vercel

## ✨ Funcionalidades

### Para Alunos
- 📚 Navegação hierárquica (Curso → Matéria → Tópico → Sub-tópico)
- 🃏 Flashcards interativos com sistema de repetição espaçada
- 📖 Sistema de aprofundamento com conteúdo rico (texto, imagem, vídeo, PDF)
- 📊 Dashboard com progresso em tempo real
- ⏱️ Cronômetro de estudo
- 📱 PWA (Progressive Web App)

### Para Administradores
- 👥 Gestão completa de usuários
- 📝 Criação e edição de conteúdo
- 🎨 Editor rico para aprofundamentos
- 📈 Estatísticas e relatórios
- 💰 Gestão de pagamentos

## 🛠️ Configuração Local

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação

1. **Clone o repositório:**
```bash
git clone https://github.com/seu-usuario/flashconcards.git
cd flashconcards
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
cp env.example .env.local
```

4. **Configure suas credenciais do Firebase no `.env.local`**

5. **Execute o servidor de desenvolvimento:**
```bash
npm run dev
```

6. **Acesse:** `http://localhost:3000`

## 🔧 Variáveis de Ambiente

### Firebase
```env
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### Mercado Pago
```env
MERCADOPAGO_ACCESS_TOKEN=seu_access_token
```

## 🔐 Configuração do Firebase

### 1. Autorizar Domínio
1. Acesse o [Firebase Console](https://console.firebase.google.com)
2. Selecione seu projeto
3. Vá para **Authentication** → **Settings** → **Authorized domains**
4. Adicione: `flashconcards.vercel.app`

### 2. Configurar Regras do Firestore
1. Vá para **Firestore Database** → **Rules**
2. Substitua as regras por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir acesso total para admins
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        (request.auth.token.email == 'claudioghabryel.cg@gmail.com' || 
         request.auth.token.email == 'natalhia775@gmail.com');
    }
    
    // Permitir acesso para usuários autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🚀 Deploy no Vercel

1. **Conecte seu repositório GitHub ao Vercel**
2. **Configure as variáveis de ambiente no Vercel**
3. **Deploy automático a cada push**

## 📱 PWA

A aplicação é um PWA completo com:
- Manifest configurado
- Service Worker
- Ícones responsivos
- Instalação na tela inicial

## 🔐 Autenticação

- Login/Registro via Firebase Auth
- Controle de acesso baseado em pagamento
- Usuários admin com privilégios especiais

## 💰 Pagamentos

- Integração com Mercado Pago
- Pagamento via PIX
- Webhook para confirmação automática
- Liberação automática após pagamento

## 📊 Estrutura do Projeto

```
FlashConCards/
├── app/                    # App Router (Next.js 14)
│   ├── admin/             # Painel administrativo
│   ├── api/               # API Routes
│   ├── dashboard/         # Dashboard do aluno
│   └── study/             # Sistema de estudo
├── components/            # Componentes React
├── lib/                   # Utilitários e configurações
├── types/                 # Definições TypeScript
└── public/               # Arquivos estáticos
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 📞 Suporte

Para suporte, entre em contato através do painel administrativo ou abra uma issue no GitHub. 