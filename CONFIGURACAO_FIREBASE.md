# 🔥 Configuração Firebase - FlashConCards

## 🎯 **Status Atual**
- ✅ Firebase instalado no projeto
- ✅ Código migrado do Supabase para Firebase
- ⏳ **Falta**: Configurar projeto no Firebase Console

## 📋 **Passo a Passo - Firebase Console**

### 1. Criar Projeto no Firebase

1. **Acesse**: https://console.firebase.google.com
2. **Clique em**: "Criar um projeto"
3. **Nome do projeto**: `flashconcards`
4. **Desabilitar Google Analytics** (opcional)
5. **Clique em**: "Criar projeto"

### 2. Configurar Firestore Database

1. **No console do Firebase**, vá em "Firestore Database"
2. **Clique em**: "Criar banco de dados"
3. **Modo**: "Iniciar no modo de teste" (para desenvolvimento)
4. **Localização**: `us-central1` (ou mais próxima do Brasil)
5. **Clique em**: "Próximo" e depois "Concluído"

### 3. Configurar Authentication

1. **Vá em**: "Authentication"
2. **Clique em**: "Começar"
3. **Método**: "Email/Senha"
4. **Ative**: "Email/Senha"
5. **Clique em**: "Salvar"

### 4. Obter Configuração do Projeto

1. **Vá em**: "Configurações do projeto" (ícone de engrenagem)
2. **Abas**: "Geral"
3. **Role até**: "Seus aplicativos"
4. **Clique em**: "Adicionar app" > "Web"
5. **Apelido**: `flashconcards-web`
6. **Clique em**: "Registrar app"
7. **Copie a configuração**:

```javascript
const firebaseConfig = {
  apiKey: "sua-api-key",
  authDomain: "flashconcards.firebaseapp.com",
  projectId: "flashconcards",
  storageBucket: "flashconcards.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### 5. Configurar Variáveis de Ambiente

**No Vercel**, adicione estas variáveis:

```
NEXT_PUBLIC_FIREBASE_API_KEY=sua-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=flashconcards.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=flashconcards
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=flashconcards.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

## 🗄️ **Estrutura do Firestore**

### Coleções que serão criadas automaticamente:

1. **`users`** - Usuários do sistema
   - `email` (string)
   - `name` (string)
   - `isPaid` (boolean)
   - `createdAt` (timestamp)
   - `lastLogin` (timestamp)

2. **`payments`** - Registros de pagamento
   - `email` (string)
   - `payment_id` (string)
   - `amount` (number)
   - `status` (string: 'approved' | 'pending' | 'rejected')
   - `method` (string: 'pix' | 'card')
   - `created_at` (timestamp)

3. **`flashcards`** - Flashcards do sistema
   - `subject` (string)
   - `question` (string)
   - `answer` (string)
   - `category` (string)
   - `difficulty` (string: 'easy' | 'medium' | 'hard')
   - `created_at` (timestamp)

4. **`userProgress`** - Progresso dos usuários
   - `userId` (string)
   - `flashcardId` (string)
   - `isCorrect` (boolean)
   - `answeredAt` (timestamp)
   - `timeSpent` (number)

## 🔒 **Regras de Segurança Firestore**

**Vá em**: Firestore Database > Regras

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários podem ler/escrever seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Pagamentos - apenas leitura para usuários autenticados
    match /payments/{paymentId} {
      allow read: if request.auth != null;
      allow write: if false; // Apenas via API
    }
    
    // Flashcards - leitura pública
    match /flashcards/{flashcardId} {
      allow read: if true;
      allow write: if false; // Apenas via admin
    }
    
    // Progresso - usuários podem gerenciar seu próprio progresso
    match /userProgress/{progressId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🧪 **Testes**

### 1. Testar Conexão
```javascript
// No console do navegador
import { db } from './lib/firebase'
console.log('Firebase conectado:', db)
```

### 2. Testar Criação de Usuário
```javascript
import { addUser } from './lib/data'
const user = await addUser({
  name: 'Teste',
  email: 'teste@email.com',
  isActive: true
})
console.log('Usuário criado:', user)
```

## 📞 **Suporte**

- **Email**: flashconcards@gmail.com
- **WhatsApp**: (62) 98184-1877

---

**🎯 Objetivo: Ter um banco de dados Firebase funcionando para o FlashConCards!** 