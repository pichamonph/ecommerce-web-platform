@echo off
echo Stopping PostgreSQL Database...
echo.

REM หยุด containers
echo Stopping containers...
docker-compose down

if %errorlevel% neq 0 (
    echo [ERROR] Failed to stop database containers.
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Database stopped successfully!
echo.
pause
