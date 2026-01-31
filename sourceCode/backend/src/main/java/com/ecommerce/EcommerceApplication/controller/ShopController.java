package com.ecommerce.EcommerceApplication.controller;

import com.ecommerce.EcommerceApplication.dto.ShopCreateRequest;
import com.ecommerce.EcommerceApplication.dto.ShopResponse;
import com.ecommerce.EcommerceApplication.dto.ShopUpdateRequest;
import com.ecommerce.EcommerceApplication.service.ShopService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class ShopController {

    private final ShopService shopService;

    public ShopController(ShopService shopService) {
        this.shopService = shopService;
    }

    // Public
    @GetMapping("/shops")
    public ResponseEntity<List<ShopResponse>> listActive() {
        return ResponseEntity.ok(shopService.listActive());
    }

    // Public
    @GetMapping("/shops/{id}")
    public ResponseEntity<ShopResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(shopService.get(id));
    }

    // Seller creates own shop (ควบคุม 1 ผู้ขาย 1 ร้าน ใน service)
    @PreAuthorize("hasRole('SELLER')")
    @PostMapping("/seller/shops")
    public ResponseEntity<?> create(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody ShopCreateRequest req) {
        if (userId == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        return ResponseEntity.ok(shopService.create(userId, req));
    }

    // Seller/Admin updates
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    @PutMapping("/seller/shops/{id}")
    public ResponseEntity<?> update(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id,
            @RequestBody ShopUpdateRequest req) {
        if (userId == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        boolean isAdmin = false; // ให้ service ตัดสินใจเพิ่มได้ภายหลังถ้าต้อง
        return ResponseEntity.ok(shopService.update(userId, id, req, isAdmin));
    }

    // Admin suspend
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/shops/{id}/suspend")
    public ResponseEntity<ShopResponse> suspend(
            @AuthenticationPrincipal Long adminId,
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.getOrDefault("reason", "") : "";
        return ResponseEntity.ok(shopService.suspendByAdmin(adminId, id, reason));
    }

    // Admin unsuspend
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/shops/{id}/unsuspend")
    public ResponseEntity<ShopResponse> unsuspend(
            @AuthenticationPrincipal Long adminId,
            @PathVariable Long id) {
        return ResponseEntity.ok(shopService.unsuspendByAdmin(adminId, id));
    }
}
