# 🚀 Guia de Deploy - FlashConCards

## 📋 Pré-requisitos

### 1. Firebase Setup
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto
3. Ative os serviços:
   - **Authentication** (Email/Password)
   - **Firestore Database**
   - **Storage**
4. Configure as regras de segurança

### 2. Mercado Pago Setup
1. Crie conta em [Mercado Pago](https://www.mercadopago.com.br/)
2. Obtenha credenciais de produção
3. Configure webhook

### 3. Vercel Setup
1. Crie conta em [Vercel](https://vercel.com/)
2. Conecte seu repositório GitHub

## 🔧 Configuração

### 1. Variáveis de Ambiente
Crie arquivo `.env.local` com:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=seu_access_token
MERCADOPAGO_PUBLIC_KEY=sua_public_key

# Next.js
NEXTAUTH_SECRET=seu_secret_aleatorio
NEXTAUTH_URL=https://seu-dominio.vercel.app

# App
NEXT_PUBLIC_APP_NAME=FlashConCards
NEXT_PUBLIC_APP_URL=https://seu-dominio.vercel.app
```

### 2. Firebase Security Rules

#### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários podem ler/escrever seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Admins podem ler/escrever todos os dados
    match /{document=**} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

#### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

## 🚀 Deploy

### 1. Vercel (Recomendado)
```bash
# 1. Push para GitHub
git add .
git commit -m "Deploy preparation"
git push origin main

# 2. Conecte no Vercel
# - Acesse vercel.com
# - Importe seu repositório
# - Configure variáveis de ambiente
# - Deploy automático
```

### 2. Firebase Hosting
```bash
# 1. Instale Firebase CLI
npm install -g firebase-tools

# 2. Login
firebase login

# 3. Inicialize
firebase init hosting

# 4. Build
npm run build

# 5. Deploy
firebase deploy
```

## 🔍 Verificação

### 1. Testes Pós-Deploy
- [ ] Login/Registro funcionando
- [ ] Upload de mídia funcionando
- [ ] Pagamentos PIX funcionando
- [ ] PWA instalável
- [ ] Responsivo em mobile

### 2. Monitoramento
- [ ] Firebase Analytics
- [ ] Vercel Analytics
- [ ] Error tracking
- [ ] Performance monitoring

## 🛠️ Manutenção

### 1. Atualizações
```bash
# Atualizar dependências
npm update

# Testar localmente
npm run dev

# Deploy
git push origin main
```

### 2. Backup
- Firebase Firestore: Export automático
- Storage: Backup manual
- Código: GitHub

## 🆘 Troubleshooting

### Problemas Comuns
1. **Erro de CORS**: Configure domínios no Firebase
2. **Upload falhando**: Verifique regras do Storage
3. **Pagamento não processa**: Verifique webhook do Mercado Pago
4. **PWA não instala**: Verifique manifest.json

### Logs
- Vercel: Dashboard > Functions
- Firebase: Console > Functions > Logs
- Browser: DevTools > Console

## 📞 Suporte

- 📧 Email: suporte@flashconcards.com
- 📱 WhatsApp: (11) 99999-9999
- 💬 Discord: FlashConCards Community 