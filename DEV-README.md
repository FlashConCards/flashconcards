# 🚀 FlashConCards - Desenvolvimento Rápido

## 📋 Comandos Disponíveis

### 🏠 **Desenvolvimento Local**
```bash
npm run dev:local    # Servidor local em http://localhost:3000
npm run dev:fast     # Servidor local com Turbo (mais rápido)
```

### 🌐 **Deploy Manual**
```bash
npm run deploy       # Deploy manual para Vercel
```

### ⚡ **Desenvolvimento + Deploy Automático**
```bash
npm run dev:auto     # Local + Deploy automático quando salvar arquivo
```

## 🎯 **Como Usar**

### **1. Desenvolvimento Local (Recomendado)**
```bash
npm run dev:local
```
- ✅ **Mais rápido** - Sem esperar deploy
- ✅ **Hot reload** - Mudanças instantâneas
- ✅ **Debug fácil** - Console local
- 🌐 Acesse: `http://localhost:3000`

### **2. Desenvolvimento + Deploy Automático**
```bash
npm run dev:auto
```
- ✅ **Servidor local** + **Deploy automático**
- ✅ **Monitora mudanças** nos arquivos
- ✅ **Deploy automático** após 3 segundos
- ⚠️ **Mais lento** - Espera deploy do Vercel

## 📁 **Estrutura de Desenvolvimento**

```
FlashConCards/
├── app/              # Páginas Next.js
├── components/       # Componentes React
├── lib/             # Utilitários (Firebase, etc.)
├── types/           # Tipos TypeScript
└── dev-script.js    # Script de desenvolvimento
```

## 🔧 **Dicas de Desenvolvimento**

### **Para Testes Rápidos:**
1. Use `npm run dev:local`
2. Teste em `http://localhost:3000`
3. Faça mudanças e veja instantaneamente

### **Para Deploy Rápido:**
1. Use `npm run dev:auto`
2. Salve qualquer arquivo
3. Deploy automático em 3 segundos

### **Para Deploy Manual:**
1. Use `npm run deploy`
2. Deploy imediato para Vercel

## 🎯 **Fluxo Recomendado**

1. **Desenvolvimento:** `npm run dev:local`
2. **Teste local:** `http://localhost:3000`
3. **Quando funcionar:** `npm run deploy`
4. **Teste produção:** `https://flashconcards.vercel.app`

## ⚡ **Vantagens**

- 🚀 **Desenvolvimento mais rápido**
- 🔄 **Hot reload instantâneo**
- 🐛 **Debug mais fácil**
- 📱 **Teste local primeiro**
- 🌐 **Deploy quando necessário** 