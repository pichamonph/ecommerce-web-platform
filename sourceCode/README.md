# E-commerce Project

โปรเจค E-commerce ที่ใช้ Next.js สำหรับ Frontend และ Spring Boot สำหรับ Backend

## โครงสร้างโปรเจค

```
E-com_project/
├── frontend/          # Next.js Frontend
├── backend/           # Spring Boot Backend
└── docker-compose.yml # Docker Compose สำหรับ PostgreSQL
```

## การติดตั้งและรัน

### 1. เริ่มต้นฐานข้อมูล PostgreSQL

#### วิธีที่ 1: ใช้ Docker (แนะนำ)

**ก่อนเริ่มต้น**: ตรวจสอบว่า Docker Desktop รันอยู่
```bash
scripts/

```

**เริ่มต้นฐานข้อมูล**:
```bash
# รัน PostgreSQL และ pgAdmin ด้วย Docker
scripts/start-database.bat

# หรือใช้คำสั่งโดยตรง
docker-compose up -d

# ตรวจสอบสถานะ
docker-compose ps
```

**หากมีปัญหา**: ดูคู่มือการแก้ไขปัญหาใน `DOCKER_SETUP.md`

#### วิธีที่ 2: ติดตั้ง PostgreSQL แบบ Local
1. ดาวน์โหลดและติดตั้ง PostgreSQL จาก https://www.postgresql.org/download/
2. สร้างฐานข้อมูล:
```sql
CREATE DATABASE ecommerce_dev;
CREATE DATABASE ecommerce_prod;
```

### 2. รัน Backend (Spring Boot)

```bash
cd backend

# Development mode



# หรือ Production mode
mvn spring-boot:run -Dspring.profiles.active=prod
```

Backend จะรันที่ http://localhost:8080

### 3. รัน Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Frontend จะรันที่ http://localhost:3000

## เทคโนโลยีที่ใช้

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- React Hook Form
- Zustand (State Management)
- Axios (HTTP Client)

### Backend
- Spring Boot 3.2.0
- Spring Security
- Spring Data JPA
- PostgreSQL Database
- JWT Authentication
- Maven

### Database
- PostgreSQL 15
- pgAdmin 4 (สำหรับจัดการฐานข้อมูล)

## โครงสร้างโฟลเดอร์

### Frontend Structure
```
frontend/
├── src/
│   ├── app/           # Next.js App Router
│   │   ├── (auth)/    # Authentication pages
│   │   ├── (dashboard)/ # Dashboard pages
│   │   ├── (shop)/    # Shop pages
│   │   └── api/       # API routes
│   ├── components/    # React components
│   │   ├── ui/        # UI components
│   │   ├── forms/     # Form components
│   │   └── layout/    # Layout components
│   ├── lib/           # Utility libraries
│   ├── hooks/         # Custom React hooks
│   ├── utils/         # Utility functions
│   ├── types/         # TypeScript types
│   └── styles/        # CSS styles
├── public/            # Static files
└── package.json
```

### Backend Structure
```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/ecommerce/EcommerceApplication/
│   │   │       ├── config/      # Configuration classes
│   │   │       ├── controller/  # REST controllers
│   │   │       ├── dto/         # Data Transfer Objects
│   │   │       ├── entity/      # JPA entities
│   │   │       ├── exception/   # Custom exceptions
│   │   │       ├── repository/  # Data repositories
│   │   │       └── service/     # Business logic
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── application-dev.properties
│   │       ├── application-prod.properties
│   │       ├── static/          # Static resources
│   │       └── templates/       # Template files
│   ├── test/                    # Test files
│   └── database/
│       └── init.sql             # Database initialization script
└── pom.xml
```

## การพัฒนา

### Environment Profiles

#### Development (dev)
- ใช้ฐานข้อมูล `99`
- `ddl-auto=create-drop` (ลบและสร้างตารางใหม่ทุกครั้ง)
- แสดง SQL logs
- Debug logging

#### Production (prod)
- ใช้ฐานข้อมูล `ecommerce_prod`
- `ddl-auto=validate` (ตรวจสอบ schema เท่านั้น)
- ไม่แสดง SQL logs
- Info level logging

### การเข้าถึงฐานข้อมูล

#### pgAdmin (Docker)
- URL: http://localhost:5050
- Email: admin@ecommerce.com
- Password: admin123

#### PostgreSQL Direct
- Host: localhost
- Port: 5432
- Database: ecommerce_dev (dev) / ecommerce_prod (prod)
- Username: postgres
- Password: password

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### Backend Environment Variables
ดูไฟล์:
- `backend/src/main/resources/application.properties` (default)
- `backend/src/main/resources/application-dev.properties` (development)
- `backend/src/main/resources/application-prod.properties` (production)

### Production Environment Variables
```bash
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
JWT_SECRET=your_secure_jwt_secret
PORT=8080
```

## การ Deploy

### Backend
```bash
cd backend
mvn clean package
java -jar target/ecommerce-application-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

### Frontend
```bash
cd frontend
npm run build
npm start
```
