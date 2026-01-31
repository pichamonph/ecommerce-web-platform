@echo off
echo Starting Spring Boot Backend...
echo.

REM ตรวจสอบว่า Maven ติดตั้งแล้วหรือไม่
mvn -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Maven is not installed or not in PATH.
    echo Please install Maven and add it to PATH.
    pause
    exit /b 1
)

REM เปลี่ยนไปยังโฟลเดอร์ backend
cd backend

REM รัน Spring Boot ใน development mode
echo Starting Spring Boot in development mode...
mvn spring-boot:run -Dspring.profiles.active=dev

pause
