@echo off
echo ========================================
echo GitHub Task Manager - Quick Setup
echo ========================================
echo.

REM Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Install dependencies
echo Installing dependencies...
call npm install

REM Run tests
echo.
echo Running tests...
call npm test
if %ERRORLEVEL% neq 0 (
    echo Tests failed! Please fix issues before continuing.
    pause
    exit /b 1
)

REM Run schema validation
echo.
echo Validating schema...
call npm run test:validate
if %ERRORLEVEL% neq 0 (
    echo Schema validation failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Create public/config/github-token.local.js with your GitHub token
echo 2. Run: npm start (to test locally)
echo 3. Push to GitHub: git push origin main
echo 4. Add TASK_MANAGER_TOKEN secret in GitHub repository settings
echo.
pause
