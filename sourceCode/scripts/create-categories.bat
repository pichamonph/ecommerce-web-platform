@echo off
echo ========================================
echo Creating Initial Categories
echo ========================================
echo.
echo Please make sure you have an ADMIN token ready.
echo You can get it by logging in as admin via the API.
echo.
set /p TOKEN="Enter your ADMIN JWT token: "
echo.
echo Creating categories...
echo.

REM Category 1: เสื้อผ้า
curl -X POST "http://localhost:8080/api/categories" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -d "{\"name\":\"เสื้อผ้า\",\"slug\":\"clothing\",\"isActive\":true}"
echo.
echo Created: เสื้อผ้า
echo.

REM Category 2: อิเล็กทรอนิกส์
curl -X POST "http://localhost:8080/api/categories" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -d "{\"name\":\"อิเล็กทรอนิกส์\",\"slug\":\"electronics\",\"isActive\":true}"
echo.
echo Created: อิเล็กทรอนิกส์
echo.

REM Category 3: ของใช้ในบ้าน
curl -X POST "http://localhost:8080/api/categories" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -d "{\"name\":\"ของใช้ในบ้าน\",\"slug\":\"home-living\",\"isActive\":true}"
echo.
echo Created: ของใช้ในบ้าน
echo.

REM Category 4: ความงาม
curl -X POST "http://localhost:8080/api/categories" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -d "{\"name\":\"ความงาม\",\"slug\":\"beauty\",\"isActive\":true}"
echo.
echo Created: ความงาม
echo.

REM Category 5: กีฬา
curl -X POST "http://localhost:8080/api/categories" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -d "{\"name\":\"กีฬา\",\"slug\":\"sports\",\"isActive\":true}"
echo.
echo Created: กีฬา
echo.

REM Category 6: หนังสือ
curl -X POST "http://localhost:8080/api/categories" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -d "{\"name\":\"หนังสือ\",\"slug\":\"books\",\"isActive\":true}"
echo.
echo Created: หนังสือ
echo.

REM Category 7: ของเล่น
curl -X POST "http://localhost:8080/api/categories" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -d "{\"name\":\"ของเล่น\",\"slug\":\"toys\",\"isActive\":true}"
echo.
echo Created: ของเล่น
echo.

REM Category 8: อาหารและเครื่องดื่ม
curl -X POST "http://localhost:8080/api/categories" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -d "{\"name\":\"อาหารและเครื่องดื่ม\",\"slug\":\"food-beverage\",\"isActive\":true}"
echo.
echo Created: อาหารและเครื่องดื่ม
echo.

REM Category 9: รองเท้า
curl -X POST "http://localhost:8080/api/categories" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -d "{\"name\":\"รองเท้า\",\"slug\":\"shoes\",\"isActive\":true}"
echo.
echo Created: รองเท้า
echo.

REM Category 10: เครื่องประดับ
curl -X POST "http://localhost:8080/api/categories" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -d "{\"name\":\"เครื่องประดับ\",\"slug\":\"accessories\",\"isActive\":true}"
echo.
echo Created: เครื่องประดับ
echo.

echo.
echo ========================================
echo All categories created successfully!
echo ========================================
pause
