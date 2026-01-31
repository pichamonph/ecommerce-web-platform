package com.ecommerce.EcommerceApplication.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

import com.ecommerce.EcommerceApplication.dto.ProductVariantDto;
import com.ecommerce.EcommerceApplication.service.ProductVariantService;

@RestController
@RequestMapping("/products")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductVariantController {

    @Autowired
    private ProductVariantService variantService;

    /**
     * Get all variants for a product
     * GET /api/products/{productId}/variants
     */
    @GetMapping("/{productId}/variants")
    public ResponseEntity<List<ProductVariantDto>> getProductVariants(
            @PathVariable Long productId,
            @RequestParam(value = "activeOnly", defaultValue = "false") boolean activeOnly) {

        try {
            List<ProductVariantDto> variants;
            if (activeOnly) {
                variants = variantService.getActiveVariantsByProductId(productId);
            } else {
                variants = variantService.getVariantsByProductId(productId);
            }
            return ResponseEntity.ok(variants);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get specific variant by ID
     * GET /api/products/variants/{variantId}
     */
    @GetMapping("/variants/{variantId}")
    public ResponseEntity<ProductVariantDto> getVariant(@PathVariable Long variantId) {
        try {
            Optional<ProductVariantDto> variant = variantService.getVariantById(variantId);
            return variant.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get variant by SKU
     * GET /api/products/variants/sku/{sku}
     */
    @GetMapping("/variants/sku/{sku}")
    public ResponseEntity<ProductVariantDto> getVariantBySku(@PathVariable String sku) {
        try {
            Optional<ProductVariantDto> variant = variantService.getVariantBySku(sku);
            return variant.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Create new variant for a product (SELLER/ADMIN only)
     * POST /api/products/{productId}/variants
     */
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @PostMapping("/{productId}/variants")
    public ResponseEntity<ProductVariantDto> createVariant(
            @PathVariable Long productId,
            @RequestBody ProductVariantDto variantDto) {

        try {
            ProductVariantDto createdVariant = variantService.createVariant(productId, variantDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdVariant);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update existing variant (SELLER/ADMIN only)
     * PUT /api/products/variants/{variantId}
     */
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @PutMapping("/variants/{variantId}")
    public ResponseEntity<ProductVariantDto> updateVariant(
            @PathVariable Long variantId,
            @RequestBody ProductVariantDto variantDto) {

        try {
            ProductVariantDto updatedVariant = variantService.updateVariant(variantId, variantDto);
            return ResponseEntity.ok(updatedVariant);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Delete variant (SELLER/ADMIN only)
     * DELETE /api/products/variants/{variantId}
     */
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @DeleteMapping("/variants/{variantId}")
    public ResponseEntity<Void> deleteVariant(@PathVariable Long variantId) {
        try {
            variantService.deleteVariant(variantId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get available variant options for a product
     * GET /api/products/{productId}/variant-options
     * Returns: {"color": ["Red", "Blue"], "size": ["S", "M", "L"]}
     */
    @GetMapping("/{productId}/variant-options")
    public ResponseEntity<Map<String, List<String>>> getVariantOptions(@PathVariable Long productId) {
        try {
            Map<String, List<String>> options = variantService.getAvailableVariantOptions(productId);
            return ResponseEntity.ok(options);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Find variants by specific options
     * POST /api/products/{productId}/variants/search
     * Body: {"color": "Red", "size": "M"}
     */
    @PostMapping("/{productId}/variants/search")
    public ResponseEntity<List<ProductVariantDto>> findVariantsByOptions(
            @PathVariable Long productId,
            @RequestBody Map<String, String> options) {

        try {
            List<ProductVariantDto> variants = variantService.findVariantsByOptions(productId, options);
            return ResponseEntity.ok(variants);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update variant stock (SELLER/ADMIN only)
     * PUT /api/products/variants/{variantId}/stock
     * Body: {"stockQuantity": 100}
     */
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @PutMapping("/variants/{variantId}/stock")
    public ResponseEntity<Void> updateVariantStock(
            @PathVariable Long variantId,
            @RequestBody Map<String, Integer> request) {

        try {
            Integer stockQuantity = request.get("stockQuantity");
            if (stockQuantity == null) {
                return ResponseEntity.badRequest().build();
            }

            variantService.updateVariantStock(variantId, stockQuantity);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Check variant availability
     * GET /api/products/variants/{variantId}/availability?quantity=2
     */
    @GetMapping("/variants/{variantId}/availability")
    public ResponseEntity<Map<String, Object>> checkVariantAvailability(
            @PathVariable Long variantId,
            @RequestParam(value = "quantity", defaultValue = "1") Integer quantity) {

        try {
            boolean available = variantService.isVariantAvailable(variantId, quantity);

            Map<String, Object> response = Map.of(
                "variantId", variantId,
                "requestedQuantity", quantity,
                "available", available
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get low stock variants across all products (SELLER/ADMIN only)
     * GET /api/products/variants/low-stock?threshold=10
     */
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @GetMapping("/variants/low-stock")
    public ResponseEntity<List<ProductVariantDto>> getLowStockVariants(
            @RequestParam(value = "threshold", defaultValue = "10") Integer threshold) {

        try {
            List<ProductVariantDto> lowStockVariants = variantService.getLowStockVariants(threshold);
            return ResponseEntity.ok(lowStockVariants);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Bulk update variant status for a product (SELLER/ADMIN only)
     * PUT /api/products/{productId}/variants/status
     * Body: {"status": "inactive"}
     */
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @PutMapping("/{productId}/variants/status")
    public ResponseEntity<Void> updateVariantStatusByProduct(
            @PathVariable Long productId,
            @RequestBody Map<String, String> request) {

        try {
            String status = request.get("status");
            if (status == null) {
                return ResponseEntity.badRequest().build();
            }

            variantService.updateVariantStatusByProductId(productId, status);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}