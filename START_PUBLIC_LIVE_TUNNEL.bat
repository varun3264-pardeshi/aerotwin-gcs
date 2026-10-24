@echo off
title Twin GCS - Instant Public Live Cloudflare Tunnel (HTTPS)
color 0A

echo ===============================================================================
echo   TWIN GCS ^| INSTANT PUBLIC INTERNET TUNNEL (FREE SECURE HTTPS)
echo   Platform: DRDO Tapas BH-201 ^| Port: 8000
echo ===============================================================================
echo.

if not exist "%~dp0cloudflared.exe" (
    echo [INFO] Downloading lightweight cloudflared binary...
    powershell -Command "Invoke-WebRequest -Uri 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' -OutFile '%~dp0cloudflared.exe'"
)

echo [OK] Cloudflare Tunnel Ready!
echo.
echo -------------------------------------------------------------------------------
echo   Connecting your local port 8000 to Cloudflare Global Edge...
echo   Look below for the "https://....trycloudflare.com" link!
echo   Share that HTTPS link with judges or open on your mobile phone!
echo -------------------------------------------------------------------------------
echo.

"%~dp0cloudflared.exe" tunnel --url http://127.0.0.1:8000

pause
