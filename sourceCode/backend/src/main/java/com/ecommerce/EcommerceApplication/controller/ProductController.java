package com.ecommerce.EcommerceApplication.controller;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
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

import com.ecommerce.EcommerceApplication.dto.CreateProductRequest;
import com.ecommerce.EcommerceApplication.dto.ProductDto;
import com.ecommerce.EcommerceApplication.dto.ProductImageDto;
import com.ecommerce.EcommerceApplication.dto.ShopResponse;
import com.ecommerce.EcommerceApplication.entity.Product;
import com.ecommerce.EcommerceApplication.repository.ProductRepository;
import com.ecommerce.EcommerceApplication.service.ProductService;
import com.ecommerce.EcommerceApplication.service.ShopService;

@RestController
@RequestMapping("/products")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {

    private final ProductRepository productRepository;
    private final ProductService productService;
    private final ShopService shopService;

    public ProductController(ProductRepository productRepository, ProductService productService,
                            ShopService shopService) {
        this.productRepository = productRepository;
        this.productService = productService;
        this.shopService = shopService;
    }

    @GetMapping
    public ResponseEntity<?> getAllProducts(@RequestParam(required = false) Long shopId) {
        try {
            List<ProductDto> products;
            if (shopId != null) {
                // Filter by shop for seller
                products = productService.getByShopId(shopId);
            } else {
                // Get all active products for public
                products = productService.getAllProducts();
            }
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        try {
            ProductDto product = productService.getById(id);
            return ResponseEntity.ok(product);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchProducts(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        try {
            Page<ProductDto> result = productService.search(q, categoryId, status, org.springframework.data.domain.PageRequest.of(page, size));
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<?> createProduct(
            @AuthenticationPrincipal Long userId,
            @RequestBody CreateProductRequest request) {
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

            // Create product
            ProductDto product = productService.createProduct(shop.getId(), request);
            return ResponseEntity
                    .created(URI.create("/products/" + product.id))
                    .body(product);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Failed to create product: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<?> updateProduct(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id,
            @RequestBody Product product) {
        try {
            if (userId == null) {
                return ResponseEntity.status(401).body("Unauthorized");
            }

            // Get the existing product to verify ownership
            ProductDto existingProduct = productService.getById(id);

            // Get seller's shop
            ShopResponse shop = shopService.getByOwnerId(userId);
            if (shop == null) {
                return ResponseEntity.status(403).body("Forbidden: Seller does not have a shop");
            }

            // Verify the product belongs to seller's shop
            if (!existingProduct.shopId.equals(shop.getId())) {
                return ResponseEntity.status(403)
                    .body("Forbidden: You can only edit products from your own shop");
            }

            return productService.updateProduct(id, product)
                    .map(updated -> ResponseEntity.ok(productService.toDto(updated)))
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<?> deleteProduct(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id) {
        try {
            if (userId == null) {
                return ResponseEntity.status(401).body("Unauthorized");
            }

            // Get the existing product to verify ownership
            ProductDto existingProduct = productService.getById(id);

            // Get seller's shop
            ShopResponse shop = shopService.getByOwnerId(userId);
            if (shop == null) {
                return ResponseEntity.status(403).body("Forbidden: Seller does not have a shop");
            }

            // Verify the product belongs to seller's shop
            if (!existingProduct.shopId.equals(shop.getId())) {
                return ResponseEntity.status(403)
                    .body("Forbidden: You can only delete products from your own shop");
            }

            return productService.deleteProduct(id)
                    ? ResponseEntity.noContent().build()
                    : ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

}
