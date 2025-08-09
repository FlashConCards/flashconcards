# Script de deploy para FlashConCards
$env:GIT_PAGER = ""
$env:PAGER = ""

Write-Host "Iniciando deploy..." -ForegroundColor Green

# Adicionar arquivos
git config core.pager ""
git add .

# Fazer commit
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git commit -m "auto-deploy $timestamp"

# Fazer push
git push

Write-Host "Deploy concluido!" -ForegroundColor Green
Write-Host "Verifique o Vercel para confirmar o deploy automatico." -ForegroundColor Yellow
