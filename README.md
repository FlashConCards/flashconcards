# FlashConCards - Sistema de Flashcards para ALEGO

Sistema completo de flashcards para estudos da ALEGO com integração de pagamentos via Mercado Pago.

## 🚀 Deploy na Vercel

### Passo 1: Preparar o Projeto
```bash
# Instalar dependências
npm install

# Testar build local
npm run build
```

### Passo 2: Fazer Deploy
1. Acesse: https://vercel.com
2. Faça login com GitHub
3. Clique em "New Project"
4. Importe este repositório
5. Configure as variáveis de ambiente:
   - `MERCADO_PAGO_ACCESS_TOKEN` = Seu token do Mercado Pago

### Passo 3: Configurar Domínio
- O Vercel fornecerá um domínio automático
- Você pode configurar um domínio personalizado nas configurações

## 🔧 Configuração Local

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 📁 Estrutura do Projeto

```
flashconcard/
├── app/
│   ├── api/                    # APIs do Mercado Pago
│   ├── components/             # Componentes React
│   ├── dashboard/              # Área do usuário
│   ├── payment/                # Página de pagamento
│   ├── study/                  # Sistema de estudo
│   └── globals.css            # Estilos globais
├── lib/
│   └── mercadopago.ts         # Configuração MP
└── CONFIGURACAO_MERCADO_PAGO.md
```

## 💰 Integração de Pagamentos

- **PIX**: R$ 99,90 (pagamento único)
- **Cartão**: R$ 129,99 (até 12x sem juros)
- **Mercado Pago**: Processamento seguro
- **Status Automático**: Verificação de pagamentos

## 🎯 Funcionalidades

- ✅ Sistema de flashcards interativo
- ✅ Pagamentos PIX e cartão
- ✅ Dashboard do usuário
- ✅ Progresso de estudos
- ✅ Interface responsiva
- ✅ Deploy automático

## 📞 Suporte

- Email: flashconcards@gmail.com
- WhatsApp: (62) 98184-1877

## 🔒 Segurança

- Tokenização de dados
- Validação de campos
- HTTPS automático
- Logs de pagamentos

---

**FlashConCards** - Transformando a forma de estudar para a ALEGO! 📚✨ 