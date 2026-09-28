@echo off
title Arkiii Main - GitHub Upload
color 0A

echo ==========================================
echo       ARKIII-MAIN GITHUB UPLOADER
echo ==========================================
echo.
echo This BAT must be placed INSIDE your arkiii-main folder.
echo.
pause

cd /d "%~dp0"

echo.
echo [1/6] Checking Git...
where git >nul 2>&1
if errorlevel 1 (
    echo.
    echo ERROR: Git is not installed or not in PATH.
    echo Install Git for Windows, then run this BAT again.
    echo.
    pause
    exit /b 1
)

echo.
echo [2/6] Initializing Git repository...
if not exist ".git" git init

echo.
echo [3/6] Protecting .env...
findstr /x /c:".env" .gitignore >nul 2>&1
if errorlevel 1 echo .env>>.gitignore

echo.
echo [4/6] Adding project files...
git add .
if errorlevel 1 (
    echo.
    echo ERROR while adding files.
    pause
    exit /b 1
)

echo.
echo [5/6] Creating commit...
git diff --cached --quiet
if errorlevel 1 (
    git commit -m "Initial upload"
) else (
    echo No new files to commit.
)

echo.
echo ==========================================
echo Enter your GitHub repository URL.
echo Example:
echo https://github.com/USERNAME/REPOSITORY.git
echo ==========================================
set /p REPO_URL="GitHub URL: "

if "%REPO_URL%"=="" (
    echo.
    echo ERROR: No repository URL entered.
    pause
    exit /b 1
)

echo.
echo [6/6] Connecting and uploading...

git remote get-url origin >nul 2>&1
if errorlevel 1 (
    git remote add origin "%REPO_URL%"
) else (
    git remote set-url origin "%REPO_URL%"
)

git branch -M main
git push -u origin main

if errorlevel 1 (
    echo.
    echo ==========================================
    echo UPLOAD FAILED
    echo ==========================================
    echo.
    echo Check the GitHub URL and make sure you are
    echo logged in/authenticated with Git.
    echo.
    pause
    exit /b 1
)

echo.
echo ==========================================
echo        UPLOAD SUCCESSFUL!
echo ==========================================
echo.
echo Your arkiii-main project is now on GitHub.
echo.
pause
