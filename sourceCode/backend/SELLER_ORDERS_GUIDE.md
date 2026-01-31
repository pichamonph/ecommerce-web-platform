# คู่มือเพิ่ม Seller Orders Endpoint

## ภาพรวม
เพิ่ม endpoint สำหรับ Seller ดึง orders ของสินค้าในร้านตัวเอง โดยใช้ `shopId` ที่มีอยู่ใน `OrderItem`

---

## ขั้นตอนที่ 1: แก้ไข OrderRepository.java

เพิ่ม method ใน `OrderRepository.java`:

```java
package com.ecommerce.EcommerceApplication.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ecommerce.EcommerceApplication.entity.Order;
import com.ecommerce.EcommerceApplication.entity.OrderStatus;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);
    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    List<Order> findByUserIdAndStatus(Long userId, OrderStatus status);

    // ✅ เพิ่มใหม่: Query orders ที่มี items จากร้านนี้
    @Query("SELECT DISTINCT o FROM Order o " +
           "JOIN o.items oi " +
           "WHERE oi.shopId = :shopId " +
           "ORDER BY o.createdAt DESC")
    Page<Order> findByShopId(@Param("shopId") Long shopId, Pageable pageable);

    // ✅ เพิ่มใหม่: Query orders ตาม shop และ status
    @Query("SELECT DISTINCT o FROM Order o " +
           "JOIN o.items oi " +
           "WHERE oi.shopId = :shopId AND o.status = :status " +
           "ORDER BY o.createdAt DESC")
    Page<Order> findByShopIdAndStatus(
        @Param("shopId") Long shopId,
        @Param("status") OrderStatus status,
        Pageable pageable
    );
}
```

---

## ขั้นตอนที่ 2: แก้ไข OrderService.java (Interface)

เพิ่ม method declaration:

```java
package com.ecommerce.EcommerceApplication.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.ecommerce.EcommerceApplication.dto.CheckoutReq;
import com.ecommerce.EcommerceApplication.dto.OrderDto;

public interface OrderService {
    OrderDto checkout(Long userId, CheckoutReq req);
    OrderDto getById(Long orderId);
    Page<OrderDto> listByUser(Long userId, Pageable pageable);
    OrderDto updateStatus(Long orderId, String newStatus);

    // ✅ เพิ่มใหม่: สำหรับ Seller
    Page<OrderDto> listByShop(Long shopId, Pageable pageable);
}
```

---

## ขั้นตอนที่ 3: แก้ไข OrderServiceImpl.java

เพิ่ม implementation:

```java
// ใน class OrderServiceImpl

@Override
public Page<OrderDto> listByShop(Long shopId, Pageable pageable) {
    return repo.findByShopId(shopId, pageable)
        .map(this::toDto);
}
```

**หมายเหตุ:** ถ้า `toDto` method ยังไม่มีข้อมูล user (userName, userEmail) ให้แก้ไขเพิ่มเติม:

```java
private OrderDto toDto(Order order) {
    OrderDto dto = new OrderDto();
    dto.id = order.getId();
    dto.orderNumber = order.getOrderNumber();
    dto.userId = order.getUserId();
    dto.status = order.getStatus().name();
    dto.subtotal = order.getSubtotal();
    dto.shippingFee = order.getShippingFee();
    dto.taxAmount = order.getTaxAmount();
    dto.totalAmount = order.getTotalAmount();
    dto.shippingAddress = order.getShippingAddress();
    dto.billingAddress = order.getBillingAddress();
    dto.notes = order.getNotes();
    dto.createdAt = order.getCreatedAt();
    dto.updatedAt = order.getUpdatedAt();

    // ✅ เพิ่ม: ดึงข้อมูล user (optional)
    if (order.getUserId() != null) {
        User user = userRepository.findById(order.getUserId()).orElse(null);
        if (user != null) {
            dto.userName = user.getUsername();
            dto.userEmail = user.getEmail();
        }
    }

    // Map items
    dto.items = order.getItems().stream()
        .map(this::toItemDto)
        .collect(Collectors.toList());

    return dto;
}
```

---

## ขั้นตอนที่ 4: แก้ไข OrderDto.java (ถ้าจำเป็น)

เพิ่ม fields สำหรับข้อมูล user:

```java
package com.ecommerce.EcommerceApplication.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderDto {
    public Long id;
    public String orderNumber;
    public Long userId;

    // ✅ เพิ่มใหม่
    public String userName;
    public String userEmail;

    public String status;
    public BigDecimal subtotal;
    public BigDecimal shippingFee;
    public BigDecimal taxAmount;
    public BigDecimal totalAmount;
    public String shippingAddress;
    public String billingAddress;
    public String notes;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;
    public List<OrderItemDto> items;

    // Getters and setters...
}
```

---

## ขั้นตอนที่ 5: เพิ่ม Endpoint ใน OrderController.java

```java
package com.ecommerce.EcommerceApplication.controller;

import com.ecommerce.EcommerceApplication.dto.CheckoutReq;
import com.ecommerce.EcommerceApplication.dto.OrderDto;
import com.ecommerce.EcommerceApplication.service.OrderService;
import com.ecommerce.EcommerceApplication.service.ShopService;
import com.ecommerce.EcommerceApplication.util.AuthUtils;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    private final OrderService service;
    private final ShopService shopService;  // ✅ เพิ่ม dependency
    private final AuthUtils authUtils;

    public OrderController(OrderService service, ShopService shopService, AuthUtils authUtils) {
        this.service = service;
        this.shopService = shopService;  // ✅ เพิ่ม
        this.authUtils = authUtils;
    }

    // ... existing methods ...

    // ✅ เพิ่มใหม่: Seller ดึง orders ของร้านตัวเอง
    @GetMapping("/seller/my-shop-orders")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<?> getSellerOrders(
            @AuthenticationPrincipal String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Long userId = authUtils.getUserIdFromUsername(username);

            // ดึง shop ของ seller
            var shop = shopService.getByOwnerId(userId);
            if (shop == null) {
                return ResponseEntity.badRequest()
                    .body("Seller does not have a shop");
            }

            // ดึง orders ของร้าน
            Page<OrderDto> orders = service.listByShop(shop.id, PageRequest.of(page, size));
            return ResponseEntity.ok(orders);

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("Failed to fetch shop orders: " + e.getMessage());
        }
    }
}
```

---

## ขั้นตอนที่ 6: เพิ่ม Method ใน ShopService (ถ้ายังไม่มี)

**ใน ShopService interface:**

```java
public interface ShopService {
    // ... existing methods ...

    // ✅ เพิ่มใหม่
    ShopResponse getByOwnerId(Long ownerId);
}
```

**ใน ShopServiceImpl:**

```java
@Override
public ShopResponse getByOwnerId(Long ownerId) {
    Shop shop = shopRepo.findByOwnerId(ownerId)
        .orElseThrow(() -> new IllegalArgumentException("Shop not found for owner"));
    return toResponse(shop);
}
```

**ใน ShopRepository (ถ้ายังไม่มี):**

```java
public interface ShopRepository extends JpaRepository<Shop, Long> {
    // ... existing methods ...

    Optional<Shop> findByOwnerId(Long ownerId);
}
```

---

## 📊 สรุป API Endpoints ที่ได้

### สำหรับ Customer
- `GET /orders` - ดึง orders ของตัวเอง
- `GET /orders/{id}` - ดูรายละเอียด order
- `POST /orders/checkout` - สร้าง order จาก cart

### สำหรับ Seller (ใหม่)
- `GET /orders/seller/my-shop-orders` - ดึง orders ของร้านตัวเอง
  - Query params: `page`, `size`
  - Response: Paginated list ของ OrderDto พร้อม user info

### สำหรับทั้งสอง
- `PUT /orders/{id}/status` - อัปเดตสถานะ order

---

## 🧪 ทดสอบ API

### ใช้ curl:
```bash
# Login as seller first
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seller@test.com","password":"password"}'

# Get shop orders
curl -X GET "http://localhost:8080/orders/seller/my-shop-orders?page=0&size=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response ตัวอย่าง:
```json
{
  "content": [
    {
      "id": 1,
      "orderNumber": "ORD-2024-001",
      "userId": 5,
      "userName": "customer1",
      "userEmail": "customer@test.com",
      "status": "PENDING",
      "totalAmount": 1250.00,
      "createdAt": "2024-01-15T10:30:00",
      "items": [
        {
          "productName": "เสื้อยืดสีขาว",
          "quantity": 2,
          "unitPrice": 500.00
        }
      ]
    }
  ],
  "pageable": {...},
  "totalElements": 42,
  "totalPages": 3
}
```

---

## ⚡ การปรับปรุงเพิ่มเติม (Optional)

### 1. Filter ตาม Status
เพิ่ม parameter ใน endpoint:

```java
@GetMapping("/seller/my-shop-orders")
@PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
public ResponseEntity<?> getSellerOrders(
        @AuthenticationPrincipal String username,
        @RequestParam(required = false) String status,  // ✅ เพิ่ม
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size) {
    // ...

    if (status != null && !status.isEmpty()) {
        OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
        orders = service.listByShopAndStatus(shop.id, orderStatus, PageRequest.of(page, size));
    } else {
        orders = service.listByShop(shop.id, PageRequest.of(page, size));
    }
    // ...
}
```

### 2. Statistics Endpoint
เพิ่ม endpoint สำหรับสถิติ:

```java
@GetMapping("/seller/my-shop-orders/stats")
@PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
public ResponseEntity<?> getSellerOrderStats(@AuthenticationPrincipal String username) {
    Long userId = authUtils.getUserIdFromUsername(username);
    var shop = shopService.getByOwnerId(userId);

    Map<String, Object> stats = new HashMap<>();
    stats.put("totalOrders", orderRepository.countByShopId(shop.id));
    stats.put("pendingOrders", orderRepository.countByShopIdAndStatus(shop.id, OrderStatus.PENDING));
    stats.put("completedOrders", orderRepository.countByShopIdAndStatus(shop.id, OrderStatus.COMPLETED));
    // ... more stats

    return ResponseEntity.ok(stats);
}
```

---

## 📝 Checklist

- [ ] เพิ่ม query methods ใน `OrderRepository.java`
- [ ] เพิ่ม method ใน `OrderService.java` interface
- [ ] Implement method ใน `OrderServiceImpl.java`
- [ ] เพิ่ม fields ใน `OrderDto.java` (userName, userEmail)
- [ ] เพิ่ม endpoint ใน `OrderController.java`
- [ ] เพิ่ม `getByOwnerId` ใน `ShopService`
- [ ] เพิ่ม `findByOwnerId` ใน `ShopRepository`
- [ ] ทดสอบ API ด้วย Postman/curl
- [ ] อัปเดต frontend เพื่อเรียกใช้ endpoint ใหม่

---

## 🔗 ไฟล์ที่ต้องแก้ไข

1. `backend/src/main/java/com/ecommerce/EcommerceApplication/repository/OrderRepository.java`
2. `backend/src/main/java/com/ecommerce/EcommerceApplication/service/OrderService.java`
3. `backend/src/main/java/com/ecommerce/EcommerceApplication/service/impl/OrderServiceImpl.java`
4. `backend/src/main/java/com/ecommerce/EcommerceApplication/dto/OrderDto.java`
5. `backend/src/main/java/com/ecommerce/EcommerceApplication/controller/OrderController.java`
6. `backend/src/main/java/com/ecommerce/EcommerceApplication/service/ShopService.java`
7. `backend/src/main/java/com/ecommerce/EcommerceApplication/service/impl/ShopServiceImpl.java`
8. `backend/src/main/java/com/ecommerce/EcommerceApplication/repository/ShopRepository.java`
