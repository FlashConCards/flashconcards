# 📧 Configuração do Sistema de Email Automático

## 🎯 **Sistema Automático e Personalizado**

### ✅ **Problemas Resolvidos:**

1. **✅ Email Automático**: Agora os emails são enviados automaticamente via Google Apps Script
2. **✅ Design Profissional**: Emails com layout moderno e responsivo (não mais texto de WhatsApp)
3. **✅ Personalização**: Emails personalizados com nome do usuário e curso
4. **✅ Envio Automático**: Emails são enviados automaticamente quando:
   - Usuário compra curso (via webhook do Mercado Pago)
   - Admin adiciona usuário (via painel administrativo)

---

## 📋 **Passo a Passo:**

### 1. **Criar Google Apps Script**
1. Acesse: https://script.google.com/
2. Clique em **"Novo projeto"**
3. Cole o código do arquivo `google-apps-script-code.js`
4. Salve o projeto (Ctrl+S)
5. Dê um nome como "FlashConCards Email"

### 2. **Fazer Deploy**
1. Clique em **"Deploy"** > **"New deployment"**
2. Escolha **"Web app"**
3. Configure:
   - **Execute as:** "Me"
   - **Who has access:** "Anyone"
4. Clique em **"Deploy"**
5. **Copie a URL** gerada (algo como: `https://script.google.com/macros/s/...`)

### 3. **Configurar no Vercel**
1. Vá para seu projeto no Vercel
2. Acesse **Settings** > **Environment Variables**
3. Adicione:
   - **Name:** `GOOGLE_APPS_SCRIPT_URL`
   - **Value:** Cole a URL do Google Apps Script
4. Clique em **Save**

### 4. **Testar**
1. Acesse: `https://seu-site.vercel.app/api/test-email-gmail`
2. Use Postman ou similar para testar:
```json
{
  "type": "welcome",
  "userEmail": "seu-email@gmail.com",
  "userName": "Seu Nome",
  "courseName": "Curso Teste"
}
```

---

## 🎨 **Melhorias no Design:**

### **Antes (Texto WhatsApp):**
```
Olá João! 👋
Estamos muito felizes em ter você conosco!
🎯 Curso de Medicina
🚀 O que você tem acesso:
• 📚 Flashcards interativos
• 📊 Estatísticas detalhadas
```

### **Agora (Email Profissional):**
- ✅ **Layout moderno** com gradientes e cores
- ✅ **Design responsivo** para mobile e desktop
- ✅ **Seções organizadas** com ícones e destaque
- ✅ **Botões de ação** com hover effects
- ✅ **Tipografia profissional** e espaçamento adequado
- ✅ **Cores consistentes** com a marca

---

## 🔧 **Outras Opções:**

### **Opção 2: Brevo (Mais Profissional)**
1. Acesse: https://app.brevo.com/settings/keys/api
2. Crie conta gratuita
3. Copie API key
4. Adicione `BREVO_API_KEY=sua_chave` no Vercel

### **Opção 3: Resend (Mais Profissional)**
1. Acesse: https://resend.com/api-keys
2. Crie conta
3. Copie API key
4. Adicione `RESEND_API_KEY=sua_chave` no Vercel

---

## ✅ **Vantagens do Sistema Atual:**

- ✅ **100% Automático** - Sem intervenção manual
- ✅ **Design Profissional** - Layout moderno e responsivo
- ✅ **Personalização Completa** - Nome, curso, data de expiração
- ✅ **Envio Imediato** - Quando pagamento é aprovado
- ✅ **100% Gratuito** - Usa sua conta Gmail
- ✅ **Configuração Simples** - 5 minutos para configurar
- ✅ **Sem Spam** - Vai direto para caixa de entrada
- ✅ **Confiança** - Gmail é confiável

---

## 🚨 **Importante:**

- O Gmail tem limite de **500 emails por dia** (suficiente para a maioria)
- Use uma conta Gmail que você controla
- O Google Apps Script é executado na sua conta Google
- **Emails são enviados automaticamente** quando:
  - ✅ Pagamento é aprovado no Mercado Pago
  - ✅ Admin adiciona usuário no painel

---

## 🎉 **Pronto!**

Após configurar, os emails serão enviados automaticamente com:

- 🎨 **Design profissional** e moderno
- 📱 **Layout responsivo** para todos os dispositivos
- 🎯 **Conteúdo personalizado** com nome e curso
- 🚀 **Botão de ação** para acessar a plataforma
- 💡 **Dicas e orientações** para começar a estudar
- 🎁 **Bônus e benefícios** destacados 