package com.ecommerce.EcommerceApplication.controller;

import com.ecommerce.EcommerceApplication.dto.CheckoutReq;
import com.ecommerce.EcommerceApplication.dto.OrderDto;
import com.ecommerce.EcommerceApplication.dto.ShopResponse;
import com.ecommerce.EcommerceApplication.entity.OrderStatus;
import com.ecommerce.EcommerceApplication.service.OrderService;
import com.ecommerce.EcommerceApplication.service.ShopService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    private final OrderService service;
    private final ShopService shopService;

    public OrderController(OrderService service, ShopService shopService) {
        this.service = service;
        this.shopService = shopService;
    }

    // แปลง Cart → Order (ใช้ userId จาก JWT)
    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@AuthenticationPrincipal Long userId, @RequestBody CheckoutReq req) {
        try {
            if (userId == null) {
                return ResponseEntity.status(401).body("Unauthorized");
            }
            OrderDto dto = service.checkout(userId, req);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage()); // cart/product not found / invalid input
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage()); // stock not enough / product inactive / cart empty
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@AuthenticationPrincipal Long userId, @PathVariable Long id) {
        try {
            if (userId == null) {
                return ResponseEntity.status(401).body("Unauthorized");
            }

            OrderDto order = service.getById(id);

            // ตรวจสอบว่า order เป็นของ user คนนี้หรือไม่
            if (!order.userId.equals(userId)) {
                return ResponseEntity.status(403).body("Forbidden: Not your order");
            }

            return ResponseEntity.ok(order);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    public Page<OrderDto> list(@AuthenticationPrincipal Long userId,
                               @RequestParam(defaultValue = "0") int page,
                               @RequestParam(defaultValue = "20") int size) {
        System.out.println("🔍 [OrderController] GET /orders - userId from JWT: " + userId);

        if (userId == null) {
            System.out.println("❌ [OrderController] userId is null, returning empty page");
            return Page.empty();
        }

        Page<OrderDto> orders = service.listByUser(userId, PageRequest.of(page, size));
        System.out.println("📊 [OrderController] Found " + orders.getTotalElements() + " orders for userId: " + userId);

        return orders;
    }

    // Update order status - Only order owner or seller can update
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('USER', 'SELLER', 'ADMIN')")
    public ResponseEntity<?> updateStatus(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id,
            @RequestParam String status) {
        try {
            if (userId == null) {
                return ResponseEntity.status(401).body("Unauthorized");
            }

            // Get the order first
            OrderDto order = service.getById(id);

            // Check if user is the order owner OR a seller with items in this order
            boolean isOrderOwner = order.userId.equals(userId);
            boolean isSeller = false;

            if (!isOrderOwner) {
                // Check if user is a seller and has a shop with items in this order
                try {
                    ShopResponse shop = shopService.getByOwnerId(userId);
                    if (shop != null) {
                        // Check if any order items belong to this seller's shop
                        isSeller = order.items.stream()
                                .anyMatch(item -> item.shopId != null && item.shopId.equals(shop.getId()));
                    }
                } catch (Exception e) {
                    // User doesn't have a shop or error getting shop
                }
            }

            if (!isOrderOwner && !isSeller) {
                return ResponseEntity.status(403).body("Forbidden: You don't have permission to update this order");
            }

            return ResponseEntity.ok(service.updateStatus(id, status));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // For Seller: Get orders from their shop
    @GetMapping("/seller/my-shop-orders")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<?> getSellerOrders(
            @AuthenticationPrincipal Long userId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            if (userId == null) {
                return ResponseEntity.status(401).body("Unauthorized");
            }

            // Get seller's shop
            ShopResponse shop = shopService.getByOwnerId(userId);
            if (shop == null) {
                return ResponseEntity.badRequest()
                    .body("Seller does not have a shop. Please create a shop first.");
            }

            // Get orders for the shop
            Page<OrderDto> orders;
            if (status != null && !status.trim().isEmpty()) {
                try {
                    OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
                    orders = service.listByShopAndStatus(shop.getId(), orderStatus, PageRequest.of(page, size));
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest()
                        .body("Invalid status: " + status + ". Valid values: PENDING, PROCESSING, SHIPPED, COMPLETED, CANCELLED");
                }
            } else {
                orders = service.listByShop(shop.getId(), PageRequest.of(page, size));
            }

            return ResponseEntity.ok(orders);

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("Failed to fetch shop orders: " + e.getMessage());
        }
    }
}
