# Configuração de Email - FlashConCards

## 📧 Configuração do Gmail para Envio de Emails

### 1. Configurar Gmail
1. Acesse sua conta Gmail
2. Vá em **Configurações** > **Contas e Importação**
3. Ative a **Verificação em duas etapas**
4. Gere uma **Senha de App**:
   - Vá em **Segurança** > **Senhas de app**
   - Selecione "Email" e gere uma senha

### 2. Variáveis de Ambiente
Adicione estas variáveis no seu arquivo `.env.local`:

```env
# Email Configuration
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app-do-gmail
NEXT_PUBLIC_SITE_URL=https://flashconcards.vercel.app
```

### 3. Configuração no Vercel
Adicione as mesmas variáveis no dashboard do Vercel:
1. Vá para seu projeto no Vercel
2. **Settings** > **Environment Variables**
3. Adicione:
   - `EMAIL_USER` = seu-email@gmail.com
   - `EMAIL_PASS` = sua-senha-de-app-do-gmail
   - `NEXT_PUBLIC_SITE_URL` = https://flashconcards.vercel.app

### 4. Teste
Após a configuração, quando alguém fizer uma compra e o pagamento for aprovado, um email será enviado automaticamente com:
- ✅ Confirmação da compra
- ✅ Detalhes da transação
- ✅ Link para acessar o sistema
- ✅ Senha de login (souflashconcards)

### 5. Template do Email
O email inclui:
- 🎉 Cabeçalho comemorativo
- 📋 Detalhes da compra
- 🚀 Lista de benefícios
- 🎯 Botão para começar a estudar
- 💡 Dica com a senha de login
- 📧 Informações de contato

### ⚠️ Importante
- Use sempre uma **senha de app** do Gmail, nunca sua senha principal
- Mantenha as variáveis de ambiente seguras
- Teste o envio antes de colocar em produção 