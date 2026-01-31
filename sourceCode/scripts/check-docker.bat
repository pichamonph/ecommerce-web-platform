@echo off
echo Checking Docker Status...
echo.

REM ตรวจสอบว่า Docker ติดตั้งแล้วหรือไม่
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed or not in PATH.
    echo.
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/
    echo After installation, make sure Docker Desktop is running.
    pause
    exit /b 1
)

echo [OK] Docker is installed.
docker --version

echo.
echo Checking Docker Desktop status...

REM ตรวจสอบว่า Docker Desktop รันอยู่หรือไม่
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Desktop is not running.
    echo.
    echo Please start Docker Desktop and wait for it to fully load.
    echo You should see the Docker icon in your system tray.
    echo.
    echo After starting Docker Desktop, run this script again.
    pause
    exit /b 1
)

echo [OK] Docker Desktop is running.
echo.
echo Docker is ready to use!
echo You can now run: scripts/start-database.bat
echo.
pause
