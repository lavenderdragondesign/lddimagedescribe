@echo off
cd /d %~dp0

REM Completely reset Git and force overwrite the remote
rmdir /s /q .git
git init
git remote add origin https://github.com/lavenderdragondesign/lddimagedescribe.git
git add .
git commit -m "Full force push: replacing everything on remote"
git branch -M main
git push -u origin main --force

pause