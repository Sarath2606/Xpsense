@echo off
echo Starting Xpenses Backend Servers...
echo.

echo Starting Mock Mastercard API on port 3002...
start "Mock Mastercard API" cmd /k "node mock-mastercard-api.js"

echo Waiting 3 seconds...
timeout /t 3 /nobreak > nul

echo Starting Simple Backend Server on port 3001...
start "Simple Backend Server" cmd /k "node simple-server.js"

echo.
echo Both servers are starting...
echo - Mock Mastercard API: http://localhost:3002
echo - Simple Backend Server: http://localhost:3001
echo.
echo Press any key to exit this window...
pause > nul
