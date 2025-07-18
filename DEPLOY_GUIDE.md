# 🚀 Guia Rápido - Deploy FlashConCards

## Passo 1: Preparar o Repositório

1. **Criar conta no GitHub** (se não tiver)
2. **Criar novo repositório** no GitHub
3. **Subir o código** para o GitHub:

```bash
# Inicializar git (se não estiver inicializado)
git init

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Primeira versão do FlashConCards"

# Adicionar repositório remoto (substitua pela URL do seu repo)
git remote add origin https://github.com/SEU_USUARIO/flashconcards.git

# Enviar para o GitHub
git push -u origin main
```

## Passo 2: Deploy na Vercel

1. **Acesse**: https://vercel.com
2. **Faça login** com sua conta GitHub
3. **Clique em "New Project"**
4. **Importe o repositório** do FlashConCards
5. **Configure as variáveis de ambiente**:
   - `MERCADO_PAGO_ACCESS_TOKEN` = Seu token do Mercado Pago

## Passo 3: Configurar Mercado Pago

1. **Obter Access Token**:
   - Acesse: https://www.mercadopago.com.br/developers
   - Faça login na sua conta
   - Vá em "Suas integrações" > "Credenciais"
   - Copie o **Access Token** de produção

2. **Adicionar na Vercel**:
   - Vá em Settings > Environment Variables
   - Adicione: `MERCADO_PAGO_ACCESS_TOKEN`
   - Valor: Seu token do Mercado Pago

## Passo 4: Testar

1. **Acesse o site** (URL fornecida pela Vercel)
2. **Teste o PIX**:
   - Vá em `/payment`
   - Preencha os dados
   - Gere um PIX
   - Teste o pagamento

3. **Teste o cartão**:
   - Use dados de teste do Mercado Pago
   - Verifique se o pagamento é processado

## URLs Importantes

- **Site**: https://flashconcards.vercel.app (exemplo)
- **Pagamentos**: https://flashconcards.vercel.app/payment
- **Dashboard**: https://flashconcards.vercel.app/dashboard

## Configurações Adicionais

### Domínio Personalizado
1. Vá em Settings > Domains
2. Adicione seu domínio
3. Configure os DNS conforme instruções

### Monitoramento
- **Vercel Analytics**: Ative para acompanhar visitas
- **Mercado Pago**: Monitore pagamentos no painel

## Troubleshooting

### Erro de Build
- Verifique se todas as dependências estão instaladas
- Teste localmente: `npm run build`

### Erro de Pagamento
- Verifique se o Access Token está correto
- Confirme se está usando token de produção

### Erro de API
- Verifique os logs na Vercel
- Teste as APIs localmente

## Próximos Passos

1. **Configurar domínio personalizado**
2. **Implementar webhooks do Mercado Pago**
3. **Adicionar analytics**
4. **Configurar backup automático**

---

**🎉 Parabéns! Seu FlashConCards está online!**

Para suporte: flashconcards@gmail.com 