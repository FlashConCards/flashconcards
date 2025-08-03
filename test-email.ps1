# Script para testar o sistema de email do FlashConCards
# Execute este script no PowerShell

param(
    [Parameter(Mandatory=$true)]
    [string]$Email
)

Write-Host "🧪 Testando sistema de email do FlashConCards..." -ForegroundColor Cyan
Write-Host "Email de destino: $Email" -ForegroundColor Yellow
Write-Host ""

# URL da API de teste (ajuste conforme necessário)
$apiUrl = "http://localhost:3000/api/test-email-verification"

Write-Host "📧 Enviando email de teste..." -ForegroundColor Green

try {
    # Preparar dados para enviar
    $body = @{
        testEmail = $Email
    } | ConvertTo-Json

    # Fazer requisição POST
    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -Body $body -ContentType "application/json"

    if ($response.success) {
        Write-Host "✅ Email de teste enviado com sucesso!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Detalhes do teste:" -ForegroundColor Cyan
        Write-Host "   Email: $($response.testEmail)" -ForegroundColor White
        Write-Host "   Código: $($response.testCode)" -ForegroundColor White
        Write-Host "   Timestamp: $($response.timestamp)" -ForegroundColor White
        Write-Host ""
        Write-Host "📬 Verifique sua caixa de entrada!" -ForegroundColor Yellow
        Write-Host "   (Verifique também a pasta de spam)" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Erro ao enviar email: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erro na requisição: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Dicas de solução:" -ForegroundColor Yellow
    Write-Host "   1. Verifique se o servidor está rodando (npm run dev)" -ForegroundColor White
    Write-Host "   2. Verifique se a URL está correta: $apiUrl" -ForegroundColor White
    Write-Host "   3. Verifique as configurações de email no .env" -ForegroundColor White
}

Write-Host ""
Write-Host "🔧 Para testar o registro completo:" -ForegroundColor Cyan
Write-Host "   1. Acesse: http://localhost:3000/register" -ForegroundColor White
Write-Host "   2. Preencha os dados" -ForegroundColor White
Write-Host "   3. Clique em 'Enviar Código'" -ForegroundColor White
Write-Host "   4. Verifique o email recebido" -ForegroundColor White 