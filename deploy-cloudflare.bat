@echo off
echo ========================================
echo   Cloudflare Deployment Script
echo ========================================
echo.

echo [1/4] Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Frontend build failed!
    pause
    exit /b 1
)
echo ✅ Frontend build completed!

echo.
echo [2/4] Deploying frontend to Cloudflare Pages...
call npm run deploy:pages
if %errorlevel% neq 0 (
    echo ERROR: Frontend deployment failed!
    pause
    exit /b 1
)
echo ✅ Frontend deployed to Cloudflare Pages!

echo.
echo [3/4] Deploying backend to Cloudflare Workers...
call npm run deploy:worker
if %errorlevel% neq 0 (
    echo ERROR: Backend deployment failed!
    pause
    exit /b 1
)
echo ✅ Backend deployed to Cloudflare Workers!

echo.
echo [4/4] Deployment completed successfully!
echo.
echo 📱 Your app is now live on Cloudflare!
echo 🔗 Check your Cloudflare dashboard for URLs
echo.
echo Next steps:
echo 1. Set up environment variables in Cloudflare dashboard
echo 2. Configure your custom domain (optional)
echo 3. Test your deployed application
echo.
pause
