# 🚀 FlashConCards - Deploy Online

## ✅ Status Atual
- ✅ Projeto configurado e funcionando
- ✅ Build de produção testado
- ✅ Integração Mercado Pago implementada
- ✅ Interface responsiva pronta
- ✅ Sistema de pagamentos funcionando

## 🎯 Próximos Passos para Deploy

### 1. Instalar Git (se não tiver)
- Baixe em: https://git-scm.com/downloads
- Instale e reinicie o terminal

### 2. Criar Repositório no GitHub
1. Acesse: https://github.com
2. Faça login/crie conta
3. Clique em "New repository"
4. Nome: `flashconcards`
5. Deixe público
6. Não inicialize com README

### 3. Subir Código para GitHub
```bash
# No terminal, na pasta do projeto:
git init
git add .
git commit -m "Primeira versão FlashConCards"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/flashconcards.git
git push -u origin main
```

### 4. Deploy na Vercel
1. Acesse: https://vercel.com
2. Faça login com GitHub
3. Clique "New Project"
4. Importe o repositório `flashconcards`
5. Clique "Deploy"

### 5. Configurar Mercado Pago
1. Acesse: https://www.mercadopago.com.br/developers
2. Faça login na sua conta
3. Vá em "Suas integrações" > "Credenciais"
4. Copie o **Access Token** de produção

### 6. Adicionar Variável de Ambiente
1. No Vercel, vá em Settings > Environment Variables
2. Adicione:
   - **Name**: `MERCADO_PAGO_ACCESS_TOKEN`
   - **Value**: Seu token do Mercado Pago
3. Clique "Save"

### 7. Testar o Site
1. Acesse a URL fornecida pela Vercel
2. Teste a página inicial
3. Teste o sistema de pagamentos
4. Verifique se tudo está funcionando

## 🌐 URLs Importantes

- **Site**: https://flashconcards.vercel.app (exemplo)
- **Pagamentos**: /payment
- **Dashboard**: /dashboard
- **Estudo**: /study/[materia]

## 💰 Valores Configurados

- **PIX**: R$ 99,90
- **Cartão**: R$ 129,99 (até 12x)

## 🔧 Funcionalidades Prontas

- ✅ Landing page responsiva
- ✅ Sistema de flashcards
- ✅ Pagamentos PIX e cartão
- ✅ Dashboard do usuário
- ✅ Progresso de estudos
- ✅ Interface moderna
- ✅ Deploy automático

## 📞 Suporte

- **Email**: flashconcards@gmail.com
- **WhatsApp**: (62) 98184-1877

## 🎉 Resultado Final

Após seguir estes passos, você terá:
- ✅ Site 100% online
- ✅ Sistema de pagamentos funcionando
- ✅ Dinheiro caindo na sua conta
- ✅ Interface profissional
- ✅ Deploy automático

---

**🚀 FlashConCards Online - Transformando a forma de estudar para a ALEGO!**

**Tempo estimado para deploy: 30 minutos** 