@echo off
chcp 65001 >nul
title SmartScheduler
cd /d "%~dp0"

echo.
echo SmartScheduler baslatiliyor - DevArchitechs 2026
echo.

set API_DIR=%~dp0SmartScheduler.API
set FRONT_DIR=%~dp0smartscheduler-frontend

echo [1/3] PostgreSQL baslatiliyor (port 5433)...
docker compose up -d db >nul 2>&1
if errorlevel 1 (
    echo HATA: Docker Desktop acik degil veya kurulu degil.
    echo Docker Desktop'i acin ve tekrar calistirin.
    pause
    exit /b 1
)

set tries=0
:wait_db
set /a tries=tries+1
docker compose exec -T db pg_isready -U postgres >nul 2>&1
if errorlevel 1 (
    if %tries% LSS 15 (
        timeout /t 2 /nobreak >nul
        goto wait_db
    )
    echo UYARI: Veritabani hazir olmadi, devam ediliyor...
) else (
    echo PostgreSQL hazir.
)

echo [2/3] API baslatiliyor (http://localhost:5000)...
start "SmartScheduler API" /D "%API_DIR%" cmd /k dotnet run
timeout /t 6 /nobreak >nul

echo [3/3] Frontend baslatiliyor (http://localhost:3000)...
if not exist "%FRONT_DIR%\node_modules" (
    echo node_modules yok, npm install calistiriliyor...
    start "SmartScheduler Frontend" /D "%FRONT_DIR%" cmd /k "npm install && npm run dev"
) else (
    start "SmartScheduler Frontend" /D "%FRONT_DIR%" cmd /k "npm run dev"
)

echo.
echo Servisler baslatildi:
echo   API      -- http://localhost:5000
echo   Swagger  -- http://localhost:5000/swagger
echo   Frontend -- http://localhost:3000
echo.
echo Tarayici 12 saniye sonra acilacak...
timeout /t 12 /nobreak >nul
start "" "http://localhost:3000"

echo.
echo Hazir. Bu pencereyi kapatabilirsiniz.
pause >nul
