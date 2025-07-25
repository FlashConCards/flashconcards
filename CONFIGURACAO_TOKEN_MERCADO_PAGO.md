# Configuração do Token do Mercado Pago

## Novo Token de Acesso
```
APP_USR-1980247803255472-072422-f04f56e43fba7e2a75a5f79c97214d45-2583165550
```

## Como Configurar

### 1. No Vercel (Deploy)
1. Acesse o painel do Vercel
2. Vá em Settings > Environment Variables
3. Adicione a variável:
   - **Name**: `MERCADO_PAGO_ACCESS_TOKEN`
   - **Value**: `APP_USR-1980247803255472-072422-f04f56e43fba7e2a75a5f79c97214d45-2583165550`
4. Clique em "Save"

### 2. Localmente (.env.local)
Crie um arquivo `.env.local` na raiz do projeto com:
```
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-1980247803255472-072422-f04f56e43fba7e2a75a5f79c97214d45-2583165550
```

## Valor Atualizado
- **Valor**: R$ 99,90
- **Parcelamento**: 1x, 2x, 3x, 6x, 12x
- **Descrição**: FlashConCards ALEGO - R$ 99,90

## Verificação
Após configurar, teste um pagamento para confirmar que está funcionando corretamente. 