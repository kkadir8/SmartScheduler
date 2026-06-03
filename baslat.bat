@echo off
title SmartScheduler

set "ROOT=%~dp0"
set "API_DIR=%ROOT%SmartScheduler.API"
set "FRONT_DIR=%ROOT%smartscheduler-frontend"

echo.
echo SmartScheduler baslatiliyor - DevArchitechs 2026
echo.

echo [0/3] Docker kontrol ediliyor...
docker info >nul 2>&1
if errorlevel 1 (
    echo Docker baslatiliyor...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    call :wait_for_docker
    if errorlevel 1 (
        echo HATA: Docker baslatılamadı. Manuel acın ve tekrar deneyin.
        pause
        exit /b 1
    )
    echo Docker hazir.
) else (
    echo Docker zaten calisiyor.
)

echo [1/3] PostgreSQL baslatiliyor (port 5433)...
cd /d "%ROOT%"
docker compose up -d db >nul 2>&1
if errorlevel 1 (
    echo HATA: docker compose basarisiz.
    pause
    exit /b 1
)
call :wait_for_db
echo PostgreSQL hazir.

echo [2/3] API baslatiliyor (http://localhost:5000)...
start "SmartScheduler API" cmd /k "cd /d "%API_DIR%" && dotnet run"
timeout /t 6 /nobreak >nul

echo [3/3] Frontend baslatiliyor (http://localhost:3000)...
if not exist "%FRONT_DIR%\node_modules" (
    echo node_modules yok, npm install calistiriliyor...
    start "SmartScheduler Frontend" cmd /k "cd /d "%FRONT_DIR%" && npm install && npm run dev"
) else (
    start "SmartScheduler Frontend" cmd /k "cd /d "%FRONT_DIR%" && npm run dev"
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
exit /b 0

:wait_for_docker
set /a _n=0
:wfd_loop
set /a _n=_n+1
timeout /t 3 /nobreak >nul
docker info >nul 2>&1
if not errorlevel 1 exit /b 0
if %_n% lss 20 goto wfd_loop
exit /b 1

:wait_for_db
set /a _n=0
:wdb_loop
set /a _n=_n+1
timeout /t 2 /nobreak >nul
docker compose exec -T db pg_isready -U postgres >nul 2>&1
if not errorlevel 1 exit /b 0
if %_n% lss 15 goto wdb_loop
echo UYARI: Veritabani hazir olmadi, devam ediliyor...
exit /b 0
