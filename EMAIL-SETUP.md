# 📧 Configuração do Sistema de Email

## 🎯 **Opção Recomendada: Gmail (100% Gratuito)**

### 📋 **Passo a Passo:**

#### 1. **Criar Google Apps Script**
1. Acesse: https://script.google.com/
2. Clique em **"Novo projeto"**
3. Cole o código do arquivo `google-apps-script-code.js`
4. Salve o projeto (Ctrl+S)
5. Dê um nome como "FlashConCards Email"

#### 2. **Fazer Deploy**
1. Clique em **"Deploy"** > **"New deployment"**
2. Escolha **"Web app"**
3. Configure:
   - **Execute as:** "Me"
   - **Who has access:** "Anyone"
4. Clique em **"Deploy"**
5. **Copie a URL** gerada (algo como: `https://script.google.com/macros/s/...`)

#### 3. **Configurar no Vercel**
1. Vá para seu projeto no Vercel
2. Acesse **Settings** > **Environment Variables**
3. Adicione:
   - **Name:** `GOOGLE_APPS_SCRIPT_URL`
   - **Value:** Cole a URL do Google Apps Script
4. Clique em **Save**

#### 4. **Testar**
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

## ✅ **Vantagens do Gmail:**

- ✅ **100% Gratuito** - Sem limites
- ✅ **Usa sua conta Gmail** - Sem APIs complexas
- ✅ **Configuração em 5 minutos**
- ✅ **Emails profissionais** - HTML bonito
- ✅ **Sem spam** - Vai direto para caixa de entrada
- ✅ **Confiança** - Gmail é confiável

---

## 🚨 **Importante:**

- O Gmail tem limite de **500 emails por dia** (suficiente para a maioria)
- Use uma conta Gmail que você controla
- O Google Apps Script é executado na sua conta Google

---

## 🎉 **Pronto!**

Após configurar, os emails serão enviados automaticamente quando:
- ✅ Usuário comprar curso
- ✅ Admin adicionar usuário

Os emails incluem:
- 🎨 Design profissional
- 📱 Responsivo
- 🎯 Conteúdo personalizado
- 🚀 Botão para acessar o curso 