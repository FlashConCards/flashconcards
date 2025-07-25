# Solução para Erro do PIX

## Problema
```
Erro ao gerar PIX: Collector user without key enabled for QR rendernull
```

## Causa
O token do Mercado Pago não tem permissões para gerar QR codes de PIX.

## Soluções

### 1. Configurar Token de Produção (Recomendado)
1. Acesse o [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. Vá em **Suas integrações**
3. Selecione sua aplicação
4. Copie o **Access Token de Produção**
5. Configure no Vercel:
   - **Name**: `MERCADO_PAGO_ACCESS_TOKEN`
   - **Value**: Seu token de produção

### 2. Verificar Permissões
1. No painel do Mercado Pago, vá em **Configurações**
2. Verifique se a opção **PIX** está habilitada
3. Confirme se o token tem permissões para:
   - Criar pagamentos
   - Gerar QR codes
   - Processar PIX

### 3. Token de Teste (Temporário)
Se não conseguir configurar o token de produção, use um token de teste:
```
TEST-123456789-abcdef-1234567890abcdef
```

### 4. Configuração no Vercel
1. Acesse o painel do Vercel
2. Vá em **Settings > Environment Variables**
3. Adicione:
   - **Name**: `MERCADO_PAGO_ACCESS_TOKEN`
   - **Value**: Seu token válido
4. Clique em **Save**
5. Faça um novo deploy

## Teste
Após configurar, teste o PIX para confirmar que está funcionando.

## Suporte
Se o problema persistir, entre em contato com o suporte do Mercado Pago. 