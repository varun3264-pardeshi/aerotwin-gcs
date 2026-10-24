@echo off
title TWIN GCS - AI-Enabled Real-Time Digital Twin System (MALE UAV)
color 0B
echo ============================================================================
echo   TWIN GCS (AEROTWIN-GCS) - SOVEREIGN MALE UAV PROPULSION DIGITAL TWIN
echo   DRDO Tapas BH-201 ^| Rotax 914 F / VRDE 4-Cyl Turbo Aero-Piston Engine
echo   SIH Problem ID: SIH26054 ^| Team: CodeCrew
echo ============================================================================
echo.
echo [1/2] Starting FastAPI Real-Physics Engine & AeroDB Server on Port 8000...
start "" http://localhost:8000
python "%~dp0backend\main.py"
pause
