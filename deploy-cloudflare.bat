@echo off
echo ========================================
echo   Cloudflare Pages Deployment Script
echo ========================================
echo.

echo [1/3] Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Frontend build failed!
    pause
    exit /b 1
)
echo ✅ Frontend build completed!

echo.
echo [2/3] Deploying frontend to Cloudflare Pages...
call npm run deploy:pages
if %errorlevel% neq 0 (
    echo ERROR: Frontend deployment failed!
    pause
    exit /b 1
)
echo ✅ Frontend deployed to Cloudflare Pages!

echo.
echo [3/3] Deployment completed successfully!
echo.
echo 📱 Your frontend is now live on Cloudflare Pages!
echo 🔗 Backend is running on Railway
echo 🌐 Frontend URL: Check your Cloudflare dashboard
echo 🔧 Backend URL: https://xpsense-production.up.railway.app/api
echo.
echo Next steps:
echo 1. Set up environment variables in Cloudflare dashboard
echo 2. Configure your custom domain (optional)
echo 3. Test your deployed application
echo.
pause
