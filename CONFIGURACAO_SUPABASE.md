# 🗄️ Configuração Supabase - Banco de Dados Real

## 🎯 **Por que Supabase?**
- ✅ **Gratuito** (até 50.000 linhas)
- ✅ **Tempo real** - dados sincronizados instantaneamente
- ✅ **Seguro** - criptografia automática
- ✅ **Fácil** - interface visual
- ✅ **Confiável** - nunca perde dados

## 📋 **Passo a Passo**

### 1. Criar Conta no Supabase
1. **Acesse**: https://supabase.com
2. **Clique**: "Start your project"
3. **Faça login** com GitHub
4. **Clique**: "New Project"

### 2. Configurar Projeto
1. **Organization**: Selecione sua organização
2. **Name**: `flashconcards`
3. **Database Password**: Crie uma senha forte
4. **Region**: `São Paulo` (mais rápido no Brasil)
5. **Clique**: "Create new project"

### 3. Criar Tabela de Pagamentos
1. **Vá em**: SQL Editor
2. **Cole este código**:

```sql
-- Criar tabela de pagamentos
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  payment_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('approved', 'pending', 'rejected')),
  method TEXT NOT NULL CHECK (method IN ('pix', 'card')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para busca rápida por email
CREATE INDEX idx_payments_email ON payments(email);

-- Criar índice para status aprovado
CREATE INDEX idx_payments_status ON payments(status);

-- Política de segurança (opcional)
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
```

3. **Clique**: "Run" para executar

### 4. Obter Credenciais
1. **Vá em**: Settings > API
2. **Copie**:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 5. Configurar no Vercel
1. **Acesse**: https://vercel.com/flashconcards-projects/flashconcards
2. **Vá em**: Settings > Environment Variables
3. **Adicione**:
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: Sua Project URL
4. **Adicione**:
   - **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value**: Sua anon public key

### 6. Testar
1. **Faça deploy** na Vercel
2. **Teste pagamento** com R$ 1,00
3. **Verifique** no Supabase se apareceu o registro
4. **Teste login** - deve funcionar permanentemente

## ✅ **Vantagens do Sistema Real:**

### **Antes (Memória):**
- ❌ Dados perdidos quando servidor reinicia
- ❌ Não funciona em múltiplos servidores
- ❌ Não é confiável

### **Depois (Supabase):**
- ✅ **Dados permanentes** - nunca perdem
- ✅ **Tempo real** - sincronização instantânea
- ✅ **Escalável** - funciona com milhões de usuários
- ✅ **Seguro** - criptografia automática
- ✅ **Backup automático** - nunca perde dados

## 🚀 **Resultado Final:**
- **Usuário paga** → Dados salvos no banco
- **Usuário faz login** → Verifica no banco
- **Acesso liberado** → Para sempre, em qualquer dispositivo
- **Dados seguros** → Nunca perdem, sempre disponíveis

---

**🎯 Objetivo: Sistema 100% confiável e permanente!** 