# Configuração do Mercado Pago - FlashConCards

## Passos para Configurar

### 1. Obter Access Token do Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers
2. Faça login na sua conta do Mercado Pago
3. Vá em "Suas integrações" > "Credenciais"
4. Copie o **Access Token** de produção (não o de teste)

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com:

```env
MERCADO_PAGO_ACCESS_TOKEN=SEU_ACCESS_TOKEN_AQUI
```

### 3. Testar a Integração

1. Execute o projeto: `npm run dev`
2. Acesse: http://localhost:3000/payment
3. Preencha os dados pessoais
4. Teste o PIX primeiro (mais simples)
5. Depois teste o cartão

## Como Funciona

### PIX
- O usuário preenche os dados pessoais
- Clica em "Gerar PIX"
- O sistema cria um pagamento no Mercado Pago
- Retorna o QR Code e código PIX
- O usuário paga e recebe acesso imediato

### Cartão
- O usuário preenche os dados do cartão
- O sistema processa o pagamento
- Se aprovado, redireciona para sucesso
- Se recusado, mostra erro

## Valores Configurados

- **PIX**: R$ 99,90 (pagamento único)
- **Cartão**: R$ 129,99 (até 12x sem juros)

## Próximos Passos

1. **Tokenização do Cartão**: Implementar a tokenização real do cartão
2. **Webhooks**: Configurar webhooks para notificações automáticas
3. **Validação**: Adicionar validações mais robustas
4. **Logs**: Implementar sistema de logs para pagamentos
5. **Dashboard**: Criar dashboard para acompanhar vendas

## Suporte

Se precisar de ajuda:
- Email: flashconcards@gmail.com
- WhatsApp: (62) 98184-1877

## Notas Importantes

- O Access Token deve ser de **produção**, não de teste
- Mantenha o token seguro e não compartilhe
- Teste sempre em ambiente de desenvolvimento primeiro
- Monitore os pagamentos no painel do Mercado Pago 