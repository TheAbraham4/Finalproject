@echo off
echo ========================================
echo Abraham Restaurant - Botpress Integration
echo ========================================
echo.

echo Step 1: Starting Backend Server...
cd backend
start "Abraham Restaurant Backend" cmd /k "npm start"
echo ✅ Backend starting in new window...
echo.

echo Step 2: Waiting for backend to start...
timeout /t 5 /nobreak > nul
echo.

echo Step 3: Starting ngrok tunnel...
cd ..
start "ngrok Tunnel" cmd /k "ngrok http 8080"
echo ✅ ngrok starting in new window...
echo.

echo ========================================
echo NEXT STEPS:
echo ========================================
echo.
echo 1. Look at the ngrok window for the HTTPS URL
echo    Example: https://abc123.ngrok.io
echo.
echo 2. Copy that URL and follow the guide:
echo    ABRAHAM-RESTAURANT-BOTPRESS-MYSQL-SETUP.md
echo.
echo 3. Replace the API_URL in your Botpress action
echo.
echo 4. Test your chatbot!
echo.
echo ========================================
pause
