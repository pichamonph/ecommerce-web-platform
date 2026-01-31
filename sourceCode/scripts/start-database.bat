@echo off
echo Starting PostgreSQL Database with Docker...
echo.

REM ตรวจสอบว่า Docker ทำงานอยู่หรือไม่
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Desktop is not running.
    echo.
    echo Please run: scripts/check-docker.bat
    echo.
    pause
    exit /b 1
)

echo [OK] Docker is running.
echo.

REM รัน PostgreSQL และ pgAdmin
echo Starting PostgreSQL and pgAdmin...
docker-compose up -d

if %errorlevel% neq 0 (
    echo [ERROR] Failed to start database containers.
    echo.
    echo Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Database started successfully!
echo.
echo PostgreSQL:
echo - Host: localhost
echo - Port: 5432
echo - Database: ecommerce_dev
echo - Username: postgres
echo - Password: password
echo.
echo pgAdmin:
echo - URL: http://localhost:5050
echo - Email: admin@ecommerce.com
echo - Password: admin123
echo.
echo You can now run: scripts/start-backend.bat
echo.
pause
