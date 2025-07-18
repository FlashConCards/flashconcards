# 💰 Configuração Final - Mercado Pago

## 🎯 **Status Atual**
- ✅ Site online: https://flashconcards.vercel.app
- ✅ Código integrado com Mercado Pago
- ⏳ **Falta**: Configurar Access Token

## 📋 **Passo a Passo**

### 1. Obter Access Token do Mercado Pago

1. **Acesse**: https://www.mercadopago.com.br/developers
2. **Faça login** na sua conta do Mercado Pago
3. **Vá em**: "Suas integrações" > "Credenciais"
4. **Copie o Access Token** de **PRODUÇÃO** (não o de teste)

### 2. Adicionar na Vercel

1. **Acesse**: https://vercel.com/flashconcards-projects/flashconcards
2. **Vá em**: Settings > Environment Variables
3. **Adicione**:
   - **Name**: `MERCADO_PAGO_ACCESS_TOKEN`
   - **Value**: Cole seu token aqui
4. **Clique**: Save

### 3. Testar Pagamentos

1. **Acesse**: https://flashconcards.vercel.app/payment
2. **Preencha** os dados pessoais
3. **Teste PIX**:
   - Clique em "Gerar PIX"
   - Deve aparecer QR Code
   - Teste com valor pequeno

4. **Teste Cartão**:
   - Use dados de teste do Mercado Pago
   - Cartão: 4509 9535 6623 3704
   - CVV: 123
   - Validade: 12/25

## 🧪 **Dados de Teste Mercado Pago**

### PIX
- Funciona com qualquer valor
- Aprovação instantânea

### Cartão de Teste
- **Número**: 4509 9535 6623 3704
- **CVV**: 123
- **Validade**: 12/25
- **Nome**: Qualquer nome

## ✅ **Como Verificar se Funcionou**

1. **PIX**: Deve gerar QR Code
2. **Cartão**: Deve processar pagamento
3. **Vercel Logs**: Verificar se não há erros
4. **Mercado Pago**: Verificar se aparece na conta

## 🔧 **Troubleshooting**

### Erro: "Access Token inválido"
- Verifique se copiou o token correto
- Confirme se é token de PRODUÇÃO

### Erro: "Pagamento não processado"
- Verifique os logs na Vercel
- Confirme se a API está funcionando

### PIX não gera QR Code
- Verifique se o token está configurado
- Teste com valores pequenos

## 📞 **Suporte**

- **Email**: flashconcards@gmail.com
- **WhatsApp**: (62) 98184-1877

---

**🎯 Objetivo: Receber pagamentos reais na sua conta do Mercado Pago!** 