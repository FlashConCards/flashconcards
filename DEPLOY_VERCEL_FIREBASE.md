# 🚀 Deploy Vercel + Firebase - FlashConCards

## 🎯 **Status Atual**
- ✅ Código migrado para Firebase
- ✅ Build funcionando
- ✅ Firebase configurado no projeto
- ⏳ **Falta**: Configurar Firebase Console e Vercel

## 📋 **Passo 1: Configurar Firebase Console**

### 1.1 Criar Projeto Firebase
1. **Acesse**: https://console.firebase.google.com
2. **Clique em**: "Criar um projeto"
3. **Nome**: `flashconcards`
4. **Desabilitar Google Analytics** (opcional)
5. **Clique em**: "Criar projeto"

### 1.2 Configurar Firestore Database
1. **Vá em**: "Firestore Database"
2. **Clique em**: "Criar banco de dados"
3. **Modo**: "Iniciar no modo de teste"
4. **Localização**: `us-central1`
5. **Clique em**: "Próximo" e "Concluído"

### 1.3 Configurar Authentication
1. **Vá em**: "Authentication"
2. **Clique em**: "Começar"
3. **Método**: "Email/Senha"
4. **Ative**: "Email/Senha"
5. **Clique em**: "Salvar"

### 1.4 Obter Configuração
1. **Vá em**: "Configurações do projeto" (ícone de engrenagem)
2. **Abas**: "Geral"
3. **Role até**: "Seus aplicativos"
4. **Clique em**: "Adicionar app" > "Web"
5. **Apelido**: `flashconcards-web`
6. **Clique em**: "Registrar app"
7. **Copie a configuração**:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "flashconcards.firebaseapp.com",
  projectId: "flashconcards",
  storageBucket: "flashconcards.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

## 📋 **Passo 2: Configurar Vercel**

### 2.1 Fazer Deploy no Vercel
1. **Acesse**: https://vercel.com
2. **Faça login** com GitHub
3. **Clique em**: "New Project"
4. **Importe o repositório** do FlashConCards
5. **Clique em**: "Deploy"

### 2.2 Configurar Variáveis de Ambiente
**No projeto Vercel**, vá em Settings > Environment Variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=flashconcards.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=flashconcards
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=flashconcards.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
MERCADO_PAGO_ACCESS_TOKEN=TEST-123456789-abcdef
```

### 2.3 Configurar Mercado Pago
1. **Obter Access Token**:
   - Acesse: https://www.mercadopago.com.br/developers
   - Faça login na sua conta
   - Vá em "Suas integrações" > "Credenciais"
   - Copie o **Access Token** de produção

2. **Adicionar na Vercel**:
   - Vá em Settings > Environment Variables
   - Adicione: `MERCADO_PAGO_ACCESS_TOKEN`
   - Valor: Seu token do Mercado Pago

## 📋 **Passo 3: Configurar Regras Firestore**

**No Firebase Console**, vá em Firestore Database > Regras:

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

## 📋 **Passo 4: Testar Funcionalidades**

### 4.1 Testar Site
1. **Acesse**: https://flashconcards.vercel.app
2. **Verifique**: Se a página carrega sem erros
3. **Teste**: Navegação entre páginas

### 4.2 Testar Pagamentos
1. **Vá em**: `/payment`
2. **Teste PIX**:
   - Preencha dados
   - Clique em "Gerar PIX"
   - Deve aparecer QR Code
3. **Teste Cartão**:
   - Use dados de teste do Mercado Pago
   - Cartão: 4509 9535 6623 3704
   - CVV: 123
   - Validade: 12/25

### 4.3 Testar Firebase
1. **Abra console do navegador**
2. **Digite**:
```javascript
import { db } from './lib/firebase'
console.log('Firebase:', db)
```

## 📋 **Passo 5: Adicionar Conteúdo**

### 5.1 Adicionar Flashcards
**No Firebase Console**, vá em Firestore Database e adicione documentos na coleção `flashcards`:

```javascript
{
  subject: "Direito Constitucional",
  question: "Qual é a função principal do Policial Legislativo na ALEGO?",
  answer: "Garantir a segurança, ordem e funcionamento da Assembleia Legislativa de Goiás",
  category: "Segurança",
  difficulty: "medium",
  created_at: "2024-01-01T00:00:00.000Z"
}
```

### 5.2 Adicionar Usuários de Teste
```javascript
{
  email: "teste@email.com",
  name: "Usuário Teste",
  isPaid: true,
  createdAt: "2024-01-01T00:00:00.000Z",
  lastLogin: "2024-01-01T00:00:00.000Z"
}
```

## 🔧 **Troubleshooting**

### Erro: "Firebase não inicializado"
- Verifique se as variáveis de ambiente estão configuradas
- Confirme se o projeto Firebase foi criado corretamente

### Erro: "Access Token inválido"
- Verifique se o token do Mercado Pago está correto
- Confirme se é token de PRODUÇÃO

### Erro: "Pagamento não processado"
- Verifique os logs na Vercel
- Confirme se a API do Mercado Pago está funcionando

### Erro de Build
- Verifique se todas as dependências estão instaladas
- Teste localmente: `npm run build`

## 📞 **Suporte**

- **Email**: flashconcards@gmail.com
- **WhatsApp**: (62) 98184-1877

## 🎯 **Próximos Passos**

1. **Configurar domínio personalizado**
2. **Implementar webhooks do Mercado Pago**
3. **Adicionar analytics**
4. **Configurar backup automático**
5. **Adicionar mais flashcards específicos ALEGO**

---

**🎉 Parabéns! Seu FlashConCards está online com Firebase!**

**URL**: https://flashconcards.vercel.app 