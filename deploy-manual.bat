@echo off
echo ========================================
echo   Manual Cloudflare Pages Deployment
echo ========================================
echo.

echo [1/2] Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Frontend build failed!
    pause
    exit /b 1
)
echo ✅ Frontend build completed!

echo.
echo [2/2] Deploying to Cloudflare Pages...
call npm run deploy:pages
if %errorlevel% neq 0 (
    echo ERROR: Deployment failed!
    pause
    exit /b 1
)
echo ✅ Deployment completed successfully!

echo.
echo 🌐 Your app is now live on Cloudflare Pages!
echo 🔗 Check the URL shown above
echo 🔧 Backend: https://xpsense-production.up.railway.app/api
echo.
pause
