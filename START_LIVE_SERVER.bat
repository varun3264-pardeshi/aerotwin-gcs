@echo off
title Twin GCS - Sovereign MALE UAV Propulsion Digital Twin (DRDO Tapas BH-201)
color 0B

echo ===============================================================================
echo   TWIN GCS ^| SOVEREIGN PROPULSION DIGITAL TWIN GROUND CONTROL STATION
echo   Platform: DRDO Tapas BH-201 ^| Engine: Rotax 914 F Turbo Boxer
echo   SIH Problem ID: SIH26054 ^| Team: CodeCrew
echo   100%% Sovereign Air-Gapped Defense Enclave ^| Zero Cloud Dependency
echo ===============================================================================
echo.

:: Check Python installation
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python 3.9+ from https://www.python.org/
    pause
    exit /b 1
)

echo [1/3] Python Environment Detected.
echo [2/3] Checking Port 8000 Availability...

:: Free port 8000 if previous instance is hanging
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    echo Killing previous process on port 8000 (PID: %%a)...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo [3/3] Launching Twin GCS Live Server...
echo.
echo -------------------------------------------------------------------------------
echo   LOCAL ACCESS (Demo Laptop):       http://localhost:8000
echo   LAN / WI-FI ACCESS (Judges Phone): Check IP below (e.g. http://192.168.x.x:8000)
echo -------------------------------------------------------------------------------
echo.

:: Automatically open browser after 2 seconds
start "" powershell -WindowStyle Hidden -Command "Start-Sleep -Seconds 2; Start-Process http://localhost:8000"

:: Start Master Server
python "%~dp0backend\main.py"

pause
