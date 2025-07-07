@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo 🚀 StoreSystem-AI Deployment Script
echo ==================================

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git is not installed. Please install Git first.
    pause
    exit /b 1
)

REM Check if we're in a git repository
if not exist ".git" (
    echo [INFO] Initializing Git repository...
    git init
)

REM Check if remote origin exists
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo [WARNING] No remote origin found. Please add your GitHub repository URL:
    echo Example: git remote add origin https://github.com/Ved210105/StoreSystem-AI.git
    echo Run this command manually and then run this script again.
    pause
    exit /b 1
)

REM Get current branch
for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i

echo [INFO] Current branch: !CURRENT_BRANCH!

REM Check for uncommitted changes
git status --porcelain >nul 2>&1
if not errorlevel 1 (
    echo [INFO] Found uncommitted changes. Adding all files...
    git add .
    
    echo.
    set /p commit_message="Please enter a commit message (or press Enter for default): "
    
    if "!commit_message!"=="" (
        set commit_message=Update StoreSystem-AI project
    )
    
    git commit -m "!commit_message!"
    echo [INFO] Changes committed successfully!
) else (
    echo [INFO] No uncommitted changes found.
)

REM Try to pull latest changes
echo [INFO] Pulling latest changes from remote...
git pull origin !CURRENT_BRANCH! --allow-unrelated-histories >nul 2>&1
if not errorlevel 1 (
    echo [INFO] Successfully pulled latest changes.
) else (
    echo [WARNING] Could not pull latest changes. This might be the first push.
)

REM Push to remote
echo [INFO] Pushing to GitHub...
git push -u origin !CURRENT_BRANCH!
if not errorlevel 1 (
    echo ✅ Successfully deployed to GitHub!
    echo.
    echo 🎉 Your project is now live on GitHub!
    for /f "tokens=*" %%i in ('git remote get-url origin') do echo 📁 Repository URL: %%i
    echo.
    echo Next steps:
    echo 1. Visit your GitHub repository
    echo 2. Set up GitHub Pages (optional)
    echo 3. Configure deployment settings
    echo 4. Share your project with others!
) else (
    echo [ERROR] Failed to push to GitHub. Please check your credentials and try again.
    pause
    exit /b 1
)

echo.
echo [INFO] Deployment script completed!
pause 