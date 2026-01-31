package com.ecommerce.EcommerceApplication.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.EcommerceApplication.dto.ReviewCreateReq;
import com.ecommerce.EcommerceApplication.dto.ReviewDto;
import com.ecommerce.EcommerceApplication.dto.ShopResponse;
import com.ecommerce.EcommerceApplication.exception.ReviewAlreadyExistsException;
import com.ecommerce.EcommerceApplication.service.ReviewService;
import com.ecommerce.EcommerceApplication.service.ShopService;

@RestController
@RequestMapping("/reviews")
@CrossOrigin(origins = "http://localhost:3000")
public class ReviewController {

    private final ReviewService service;
    private final ShopService shopService;

    public ReviewController(ReviewService service, ShopService shopService) {
        this.service = service;
        this.shopService = shopService;
    }

    // สร้างรีวิว (ใช้ userId จาก JWT)
    @PostMapping
    public ResponseEntity<?> create(@AuthenticationPrincipal Long userId, @RequestBody ReviewCreateReq req) {
        try {
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
            }
            ReviewDto review = service.create(userId, req);
            return ResponseEntity.status(HttpStatus.CREATED).body(review); // 201 Created
        } catch (ReviewAlreadyExistsException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage()); // 409 Conflict
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage()); // 400 Bad Request
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Internal server error occurred"); // 500 Internal Server Error
        }
    }

    // รีวิวของสินค้า (เฉพาะที่ approved)
    @GetMapping
    public Page<ReviewDto> list(@RequestParam Long productId,
                                @RequestParam(defaultValue = "0") int page,
                                @RequestParam(defaultValue = "20") int size) {
        return service.listByProduct(productId, PageRequest.of(page, size));
    }

    // ร้านค้าตอบกลับรีวิว
    @PostMapping("/{id}/reply")
    public ResponseEntity<?> reply(@PathVariable Long id, @RequestParam Long shopId, @RequestBody String replyText) {
        try {
            return ResponseEntity.ok(service.addShopReply(id, shopId, replyText));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // For Seller: Get reviews by shop
    @GetMapping("/seller/my-shop-reviews")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<?> getSellerReviews(
            @AuthenticationPrincipal Long userId,
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

            // Get reviews for the shop
            Page<ReviewDto> reviews = service.listByShop(shop.getId(), PageRequest.of(page, size));

            return ResponseEntity.ok(reviews);

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("Failed to fetch reviews: " + e.getMessage());
        }
    }

    // Get reviews by shop
    @GetMapping("/shop/{shopId}")
    public Page<ReviewDto> getByShop(
            @PathVariable Long shopId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return service.listByShop(shopId, PageRequest.of(page, size));
    }
}