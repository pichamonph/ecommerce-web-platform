package com.ecommerce.EcommerceApplication.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.EcommerceApplication.dto.AddToCartReq;
import com.ecommerce.EcommerceApplication.dto.CartDto;
import com.ecommerce.EcommerceApplication.dto.CartItemDto;
import com.ecommerce.EcommerceApplication.entity.Cart;
import com.ecommerce.EcommerceApplication.entity.CartItem;
import com.ecommerce.EcommerceApplication.service.CartService;

@RestController
@RequestMapping("/cart")
@CrossOrigin(origins = "http://localhost:3000")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    // ดึง userId จาก JWT Authentication
    @GetMapping
    public ResponseEntity<CartDto> getOrCreate(@AuthenticationPrincipal Long userId) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Cart cart = cartService.getOrCreateCart(userId);
        return ResponseEntity.ok(toDto(cart, cartService.listItems(cart.getId())));
    }

    // ดึงรายการในตะกร้า (ใช้ userId จาก JWT)
    @GetMapping("/items")
    public ResponseEntity<CartDto> listItems(@AuthenticationPrincipal Long userId) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Cart cart = cartService.getOrCreateCart(userId);
        List<CartItem> items = cartService.listItems(cart.getId());
        return ResponseEntity.ok(toDto(cart, items));
    }

    // เพิ่มสินค้าเข้าตะกร้า (รองรับทั้ง product และ variant)
    @PostMapping("/items")
    public ResponseEntity<CartDto> addItem(@AuthenticationPrincipal Long userId,
                                         @RequestBody AddToCartReq request) {
        try {
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            if (!request.isValid()) {
                return ResponseEntity.badRequest().build();
            }

            Cart cart = cartService.getOrCreateCart(userId);

            CartItem addedItem;
            if (request.hasVariant()) {
                // Add product variant to cart
                addedItem = cartService.addItemWithVariant(cart.getId(), request.getProductId(),
                                                         request.getVariantId(), request.getQuantity());
            } else {
                // Add regular product to cart
                addedItem = cartService.addItem(cart.getId(), request.getProductId(), request.getQuantity());
            }

            List<CartItem> items = cartService.listItems(cart.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(toDto(cart, items));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // เพิ่มสินค้าแบบเดิม (backward compatibility)
    @PostMapping("/items/simple")
    public ResponseEntity<CartDto> addItemSimple(@AuthenticationPrincipal Long userId,
                                               @RequestParam Long productId,
                                               @RequestParam int quantity) {
        try {
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            Cart cart = cartService.getOrCreateCart(userId);

            cartService.addItem(cart.getId(), productId, quantity);
            List<CartItem> items = cartService.listItems(cart.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(toDto(cart, items));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // เปลี่ยนจำนวน (ถ้า <= 0 จะลบ และส่ง 204)
    @PutMapping("/items/{itemId}")
    public ResponseEntity<?> updateItem(@AuthenticationPrincipal Long userId,
                                    @PathVariable Long itemId,
                                    @RequestBody UpdateCartItemRequest request) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Cart cart = cartService.getOrCreateCart(userId);

        try {
            var updated = cartService.updateItem(cart.getId(), itemId, request.quantity);
            if (updated == null) return ResponseEntity.noContent().build();

            List<CartItem> items = cartService.listItems(cart.getId());
            return ResponseEntity.ok(toDto(cart, items));
        } catch (IllegalArgumentException e) {
            // Item doesn't belong to user's cart
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Forbidden: " + e.getMessage());
        }
    }

    // ลบ item (ตรวจสอบว่าเป็นของ user คนนี้)
    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Void> removeItem(@AuthenticationPrincipal Long userId, @PathVariable Long itemId) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Cart cart = cartService.getOrCreateCart(userId);

        return cartService.removeItem(cart.getId(), itemId)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    // ล้างทั้งตะกร้า
    @DeleteMapping
    public ResponseEntity<Void> clear(@AuthenticationPrincipal Long userId) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Cart cart = cartService.getOrCreateCart(userId);

        return cartService.clearCart(cart.getId())
                ? ResponseEntity.noContent().build()
                : ResponseEntity.badRequest().build();
    }

    // DTO for update request
    public static class UpdateCartItemRequest {
        public int quantity;
    }

    // ---------------- Mapping helpers ----------------
    private CartDto toDto(Cart cart, List<CartItem> items) {
        CartDto dto = new CartDto();
        dto.id = cart.getId();
        dto.userId = cart.getUserId();
        dto.createdAt = cart.getCreatedAt();
        dto.updatedAt = cart.getUpdatedAt();

        dto.items = items.stream().map(this::toItemDto).toList();
        dto.itemCount = dto.items.size();
        dto.totalQty = dto.items.stream().map(i -> i.quantity).reduce(0, Integer::sum);
        dto.subtotal = dto.items.stream()
                .map(i -> i.lineTotal != null ? i.lineTotal : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return dto;
    }

    private CartItemDto toItemDto(CartItem e) {
        CartItemDto d = new CartItemDto();
        d.id = e.getId();

        // ใช้ shadow id ให้แน่ใจว่ามีค่า แม้ relation ยัง LAZY
        d.productId = e.getProductId() != null
                ? e.getProductId()
                : (e.getProduct() != null ? e.getProduct().getId() : null);
        d.productName = (e.getProduct() != null) ? e.getProduct().getName() : null;
        d.productSku = (e.getProduct() != null) ? e.getProduct().getSku() : null;

        d.unitPrice = e.getPriceSnapshot();
        d.quantity = e.getQuantity();
        d.lineTotal = (e.getPriceSnapshot() == null || e.getQuantity() == null)
                ? BigDecimal.ZERO
                : e.getPriceSnapshot().multiply(BigDecimal.valueOf(e.getQuantity()));

        // Add product image (prefer variant image if exists, otherwise product image)
        // Return full URL for frontend Image component
        if (e.hasVariant() && e.getVariant() != null && !e.getVariant().getImages().isEmpty()) {
            String imageUrl = e.getVariant().getImages().get(0).getImageUrl();
            d.productImage = imageUrl.startsWith("http") ? imageUrl : "http://localhost:8080/api" + imageUrl;
        } else if (e.getProduct() != null && !e.getProduct().getImages().isEmpty()) {
            String imageUrl = e.getProduct().getImages().get(0).getUrl();  // ProductImage uses getUrl()
            d.productImage = imageUrl.startsWith("http") ? imageUrl : "http://localhost:8080/api" + imageUrl;
        }

        // Add stock information
        if (e.hasVariant() && e.getVariant() != null) {
            d.stock = e.getVariant().getStockQuantity();
        } else if (e.getProduct() != null) {
            d.stock = e.getProduct().getStockQuantity();
        }

        // Add variant information if exists
        if (e.hasVariant()) {
            d.variantId = e.getVariantId();
            d.variantSku = e.getVariant() != null ? e.getVariant().getSku() : null;
            d.variantTitle = e.getVariant() != null ? e.getVariant().getDisplayName() : null;
            d.variantOptions = e.getVariant() != null ? e.getVariant().getVariantOptions() : null;
            d.productName = e.getDisplayName(); // This will include variant info
            d.effectiveSku = e.getEffectiveSku(); // Variant SKU if available
        } else {
            d.effectiveSku = d.productSku;
        }

        // Add shop information
        if (e.getProduct() != null) {
            d.shopId = e.getProduct().getShopId();
            if (e.getProduct().getShop() != null) {
                d.shopName = e.getProduct().getShop().getName();
            }
        }

        return d;
    }
}
