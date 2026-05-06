@echo off
REM ============================================================
REM  SHIFTADA — Git setup inicial
REM  Execute este arquivo UMA VEZ na pasta do projeto
REM ============================================================

echo Inicializando repositorio Git...
git init
git branch -M main

echo Configurando remote origin...
git remote add origin https://github.com/kaueramone/Shiftada.git

echo Instalando dependencias...
npm install

echo Adicionando arquivos ao commit inicial...
git add .

REM Verificacao de seguranca — garante que .env.local nao esta sendo commitado
git status | findstr ".env.local" > nul
if %errorlevel% == 0 (
  echo.
  echo [ERRO] .env.local detectado no staging! Abortando commit.
  echo Verifique seu .gitignore antes de continuar.
  git reset
  pause
  exit /b 1
)

echo Fazendo primeiro commit...
git commit -m "chore: initial project setup

- Next.js 15 App Router + TypeScript + TailwindCSS
- Supabase client/server/admin separation
- Security headers configured
- .gitignore with env protection
- .env.example template"

echo Fazendo push para o GitHub...
git push -u origin main

echo.
echo Setup concluido! Projeto disponivel em:
echo https://github.com/kaueramone/Shiftada
pause
