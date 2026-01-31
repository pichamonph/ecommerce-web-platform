@echo off
echo Starting Next.js Frontend...
echo.

REM ตรวจสอบว่า Node.js ติดตั้งแล้วหรือไม่
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH.
    echo Please install Node.js and add it to PATH.
    pause
    exit /b 1
)

REM เปลี่ยนไปยังโฟลเดอร์ frontend
cd frontend

REM ตรวจสอบว่า node_modules มีอยู่หรือไม่
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM รัน Next.js ใน development mode
echo Starting Next.js in development mode...
npm run dev

pause
