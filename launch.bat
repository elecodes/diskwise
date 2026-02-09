@echo off
echo Starting Diskwise...
set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

:: Set PYTHONPATH for backend
set "PYTHONPATH=%PYTHONPATH%;%ROOT_DIR%diskwise"

:: Start Backend API
echo Starting Backend...
start /b python diskwise/api/main.py

:: Wait for backend
timeout /t 2 /nobreak >nul

:: Start Frontend and open browser
echo Starting Frontend...
cd app
npm run dev -- --open
