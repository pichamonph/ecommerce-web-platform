package com.ecommerce.EcommerceApplication.controller;

import com.ecommerce.EcommerceApplication.dto.DashboardStatsResponse;
import com.ecommerce.EcommerceApplication.dto.SellerApplicationDto;
import com.ecommerce.EcommerceApplication.dto.ShopDto;
import com.ecommerce.EcommerceApplication.dto.UserDto;
import com.ecommerce.EcommerceApplication.model.User;
import com.ecommerce.EcommerceApplication.repository.SellerApplicationRepository;
import com.ecommerce.EcommerceApplication.repository.UserRepository;
import com.ecommerce.EcommerceApplication.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')") // ทุก endpoint ใน controller นี้ต้องเป็น ADMIN
public class AdminController {

    private final SellerApplicationRepository sellerAppRepo;
    private final UserRepository userRepo;
    private final AdminService adminService;

    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role) {
        return ResponseEntity.ok(adminService.getAllUsers(search, role));
    }

    @PutMapping("/users/{userId}/ban")
    public ResponseEntity<?> banUser(@PathVariable Long userId) {
        adminService.banUser(userId);
        return ResponseEntity.ok(Map.of("message", "User banned successfully"));
    }

    @PutMapping("/users/{userId}/unban")
    public ResponseEntity<?> unbanUser(@PathVariable Long userId) {
        adminService.unbanUser(userId);
        return ResponseEntity.ok(Map.of("message", "User unbanned successfully"));
    }

    @PutMapping("/sellers/{userId}/approve")
    public ResponseEntity<?> approve(@PathVariable Long userId) {
        var user = userRepo.findById(userId).orElseThrow();

        sellerAppRepo.findTopByUserIdOrderByIdDesc(userId).ifPresent(app -> {
            app.setStatus("APPROVED");
            sellerAppRepo.save(app);
        });

        user.setRole("SELLER");
        userRepo.save(user);

        return ResponseEntity.ok().build();
    }

    // Seller Application Management
    @GetMapping("/applications")
    public ResponseEntity<List<SellerApplicationDto>> getAllApplications(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(adminService.getAllApplications(status));
    }

    @PutMapping("/applications/{applicationId}/approve")
    public ResponseEntity<?> approveApplication(@PathVariable Long applicationId) {
        adminService.approveApplication(applicationId);
        return ResponseEntity.ok(Map.of("message", "Application approved successfully"));
    }

    @PutMapping("/applications/{applicationId}/reject")
    public ResponseEntity<?> rejectApplication(@PathVariable Long applicationId) {
        adminService.rejectApplication(applicationId);
        return ResponseEntity.ok(Map.of("message", "Application rejected successfully"));
    }

    // Fix seller role for specific user
    @PostMapping("/fix-seller-role/{email}")
    public ResponseEntity<?> fixSellerRole(@PathVariable String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        String oldRole = user.getRole();
        user.setRole("ROLE_SELLER");
        userRepo.save(user);

        return ResponseEntity.ok(Map.of(
            "message", "Role fixed successfully",
            "email", email,
            "oldRole", oldRole,
            "newRole", "ROLE_SELLER"
        ));
    }

    // Shop Management
    @GetMapping("/shops")
    public ResponseEntity<List<ShopDto>> getAllShops(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean suspended) {
        return ResponseEntity.ok(adminService.getAllShops(search, suspended));
    }

    @PutMapping("/shops/{shopId}/revoke-seller")
    public ResponseEntity<?> revokeSellerRole(@PathVariable Long shopId) {
        adminService.revokeSellerRole(shopId);
        return ResponseEntity.ok(Map.of("message", "Seller role revoked and shop suspended permanently"));
    }

    // Note: suspend/unsuspend endpoints are in ShopController
}
