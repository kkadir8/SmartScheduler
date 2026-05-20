@echo off
chcp 65001 >nul
title SmartScheduler

cd /d "%~dp0"

echo.
echo  SmartScheduler baslatiliyor...
echo  DevArchitechs 2026
echo.

set API_DIR=%~dp0SmartScheduler.API
set FRONT_DIR=%~dp0smartscheduler-frontend

echo  [1/2] API baslatiliyor...  (http://localhost:5000)
start "SmartScheduler API" cmd /k "cd /d "%API_DIR%" && dotnet run"

timeout /t 5 /nobreak >nul

echo  [2/2] Frontend baslatiliyor...  (http://localhost:3000)

if not exist "%FRONT_DIR%\node_modules" (
    echo       node_modules yok, npm install calistiriliyor...
    start "SmartScheduler Frontend" cmd /k "cd /d "%FRONT_DIR%" && npm install && npm run dev"
) else (
    start "SmartScheduler Frontend" cmd /k "cd /d "%FRONT_DIR%" && npm run dev"
)

echo.
echo  Servisler baslatildi.
echo    API      --  http://localhost:5000
echo    Swagger  --  http://localhost:5000/swagger
echo    Frontend --  http://localhost:3000
echo.
echo  Tarayici 10 saniye sonra acilacak...
timeout /t 10 /nobreak >nul
start "" "http://localhost:3000"

echo.
echo  Hazir. Bu pencereyi kapatabilirsiniz.
pause >nul
