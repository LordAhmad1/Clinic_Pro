@echo off
title Medical Clinic System
color 0A

echo.
echo ========================================
echo    🏥 Medical Clinic System
echo ========================================
echo.

echo 🔍 Stopping any existing processes...
taskkill /f /im node.exe >nul 2>&1

echo.
echo 🚀 Starting Angular Application...
echo.
echo 📱 Application will be available at: http://localhost:4200
echo 🔐 Admin Login: admin@clinic.com / admin123
echo.
echo 🛑 Press Ctrl+C to stop the server
echo.

ng serve --port 4200

pause
