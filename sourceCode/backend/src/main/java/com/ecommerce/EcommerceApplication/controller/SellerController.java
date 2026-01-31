package com.ecommerce.EcommerceApplication.controller;

import com.ecommerce.EcommerceApplication.dto.SellerApplicationResponse;
import com.ecommerce.EcommerceApplication.dto.SellerApplyRequest;
import com.ecommerce.EcommerceApplication.service.SellerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

//import java.util.Map;

@RestController
@RequiredArgsConstructor
public class SellerController {

    private final SellerService sellerService;

    @PostMapping("/seller/apply")
    public ResponseEntity<?> apply(@AuthenticationPrincipal Long userId,
                                   @Valid @RequestBody SellerApplyRequest req) {
        if (userId == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        SellerApplicationResponse res = sellerService.apply(userId, req);
        return ResponseEntity.ok(res);
    }

    /*@PutMapping("/admin/sellers/{userId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approve(@AuthenticationPrincipal Long adminId,
                                     @PathVariable Long userId) {
        sellerService.approve(adminId, userId);
        return ResponseEntity.ok(Map.of("message", "seller approved"));
    }*/
}
