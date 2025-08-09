@echo off
set GIT_PAGER=
git add .
git commit -m "auto-deploy %date% %time%"
git push
echo Deploy concluido!
pause
