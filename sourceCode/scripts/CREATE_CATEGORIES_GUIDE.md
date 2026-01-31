# วิธีสร้าง Categories เริ่มต้น

## ขั้นตอนที่ 1: Login เป็น Admin และเอา JWT Token

### Option 1: ใช้ curl command

```bash
curl -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"yourpassword\"}"
```

คัดลอก JWT token จาก response (field `token`)

### Option 2: ใช้ Postman หรือ Insomnia

- POST `http://localhost:8080/api/auth/login`
- Body (JSON):
  ```json
  {
    "username": "admin",
    "password": "yourpassword"
  }
  ```
- คัดลอก token จาก response

## ขั้นตอนที่ 2: รัน Script สร้าง Categories

### Windows:
```bash
cd scripts
create-categories.bat
```

จากนั้นใส่ JWT token ที่ได้จากขั้นตอนที่ 1

### Manual (สำหรับทดสอบ):

```bash
# ตัวอย่าง: สร้าง category เสื้อผ้า
curl -X POST "http://localhost:8080/api/categories" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d "{\"name\":\"เสื้อผ้า\",\"slug\":\"clothing\",\"isActive\":true}"
```

## Categories ที่จะถูกสร้าง:

1. เสื้อผ้า (clothing)
2. อิเล็กทรอนิกส์ (electronics)
3. ของใช้ในบ้าน (home-living)
4. ความงาม (beauty)
5. กีฬา (sports)
6. หนังสือ (books)
7. ของเล่น (toys)
8. อาหารและเครื่องดื่ม (food-beverage)
9. รองเท้า (shoes)
10. เครื่องประดับ (accessories)

## ตรวจสอบ Categories ที่สร้างแล้ว:

```bash
curl -X GET "http://localhost:8080/api/categories?size=100"
```

## หมายเหตุ:

- ต้องมี Admin account ก่อน (ถ้ายังไม่มีให้สร้างผ่าน register API แล้วเปลี่ยน role เป็น ADMIN ใน database)
- JWT Token มีอายุตามที่กำหนดใน config (ปกติ 24 ชั่วโมง)
- ถ้า token หมดอายุให้ login ใหม่
