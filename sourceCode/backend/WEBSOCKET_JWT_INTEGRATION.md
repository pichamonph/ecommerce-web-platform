# WebSocket JWT Integration Guide

## สรุปการรวม JWT เข้ากับ WebSocket

ระบบได้รวม JWT authentication เข้ากับ WebSocket แล้ว เพื่อให้มีการตรวจสอบสิทธิ์ผู้ใช้งานก่อนเชื่อมต่อ

## ส่วนที่เพิ่มเข้ามา

### 1. Backend Components

#### JwtChannelInterceptor (`security/JwtChannelInterceptor.java`)
- ตรวจสอบ JWT token จาก Authorization header ขณะที่ client พยายามเชื่อมต่อ WebSocket
- Extract user ID และ roles จาก JWT token
- ใส่ authentication object ลงใน WebSocket session

#### WebSocket Configuration (`EcommerceApplication.java`)
- เพิ่ม `configureClientInboundChannel()` เพื่อลงทะเบียน JWT interceptor
- Interceptor จะทำงานทุกครั้งที่มี STOMP CONNECT command

### 2. Frontend Integration

#### ChatWebSocketService (`frontend/src/lib/chatWebSocket.ts`)
- อัพเดทให้ดึง JWT token จาก localStorage
- ส่ง token ผ่าน `connectHeaders` ใน STOMP client configuration
- Format: `Authorization: Bearer <token>`

## วิธีการทำงาน

### ขั้นตอนการเชื่อมต่อ WebSocket

1. **Client เตรียม Connection**:
   ```typescript
   const token = localStorage.getItem('token');

   client = new Client({
     connectHeaders: {
       Authorization: `Bearer ${token}`
     }
   });
   ```

2. **Backend รับ Connection Request**:
   - `JwtChannelInterceptor.preSend()` ถูกเรียกเมื่อมี STOMP CONNECT
   - ดึง Authorization header จาก native headers
   - Validate JWT token ด้วย `JwtTokenProvider`

3. **Authentication Success**:
   - Extract userId และ roles จาก token
   - สร้าง `UsernamePasswordAuthenticationToken`
   - ใส่ authentication ลงใน `StompHeaderAccessor.setUser()`
   - WebSocket session จะมีข้อมูลผู้ใช้ตลอดการเชื่อมต่อ

4. **Authentication Failure**:
   - Token invalid หรือ expired: Connection อาจถูกปฏิเสธ
   - ไม่มี token: Connection จะไม่มี authentication context

## การใช้งาน User Information ใน WebSocket Handler

หลังจากที่มีการ authenticate แล้ว คุณสามารถใช้ข้อมูล user ใน WebSocket controller ได้:

```java
@MessageMapping("/chat.send")
public void onSend(ChatSendFrame frame, Principal principal) {
    // principal จะมีค่าเป็น userId ที่ได้จาก JWT
    Long authenticatedUserId = Long.parseLong(principal.getName());

    // ตรวจสอบว่า userId ที่ส่งมาตรงกับ userId ที่ authenticated
    if (!authenticatedUserId.equals(frame.senderUserId)) {
        throw new SecurityException("Unauthorized user");
    }

    // ดำเนินการต่อ...
}
```

## การทดสอบ

### ทดสอบด้วย Browser Console

```javascript
// 1. Login และเก็บ token
localStorage.setItem('token', 'your-jwt-token-here');

// 2. WebSocket จะ auto-connect และส่ง token ใน connectHeaders

// 3. ตรวจสอบ console logs
// ✅ WebSocket authenticated for userId: 123
```

### ทดสอบด้วย Postman/STOMP Client

```
CONNECT
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
accept-version:1.2
heart-beat:10000,10000
```

## Security Benefits

1. **Authentication**: ตรวจสอบตัวตนผู้ใช้ก่อนเชื่อมต่อ WebSocket
2. **Authorization**: สามารถใช้ role-based access control ใน WebSocket messages
3. **User Context**: มีข้อมูล user ตลอด WebSocket session
4. **Consistency**: ใช้ JWT เดียวกันกับ REST API

## Troubleshooting

### WebSocket ไม่ authenticate
- ตรวจสอบว่า token ถูกส่งใน connectHeaders
- ตรวจสอบว่า token ยังไม่หมดอายุ
- ดู console logs: `❌ WebSocket JWT validation failed`

### Token หมดอายุระหว่างใช้งาน
- Frontend ควร implement token refresh mechanism
- Reconnect WebSocket หลังจาก refresh token

### CORS Issues
- ตรวจสอบ `setAllowedOriginPatterns("*")` ใน `registerStompEndpoints()`
- สำหรับ production ควรระบุ origin ที่ชัดเจน

## Next Steps (Optional Enhancements)

1. **Message-level Authorization**:
   - ตรวจสอบว่า user มีสิทธิ์ส่งข้อความในห้องนี้หรือไม่
   - ตรวจสอบว่า user เป็นสมาชิกของ chat room

2. **Token Refresh**:
   - Implement automatic token refresh ก่อน expire
   - Reconnect WebSocket ด้วย token ใหม่

3. **Role-based Channel Security**:
   - จำกัด channel บางอันสำหรับ admin เท่านั้น
   - ใช้ Spring Security channel interceptor

4. **Audit Logging**:
   - Log ทุก WebSocket connection พร้อม user info
   - Track message sending patterns
