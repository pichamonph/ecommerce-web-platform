package com.ecommerce.EcommerceApplication.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.ecommerce.EcommerceApplication.dto.ProductVariantDto;
import com.ecommerce.EcommerceApplication.entity.ProductVariant;

public interface ProductVariantService {

    /**
     * Get all variants for a product
     */
    List<ProductVariantDto> getVariantsByProductId(Long productId);

    /**
     * Get all active variants for a product
     */
    List<ProductVariantDto> getActiveVariantsByProductId(Long productId);

    /**
     * Get variant by ID
     */
    Optional<ProductVariantDto> getVariantById(Long variantId);

    /**
     * Get variant by SKU
     */
    Optional<ProductVariantDto> getVariantBySku(String sku);

    /**
     * Create new variant for a product
     */
    ProductVariantDto createVariant(Long productId, ProductVariantDto variantDto);

    /**
     * Update existing variant
     */
    ProductVariantDto updateVariant(Long variantId, ProductVariantDto variantDto);

    /**
     * Delete variant
     */
    void deleteVariant(Long variantId);

    /**
     * Update variant stock
     */
    void updateVariantStock(Long variantId, Integer stockQuantity);

    /**
     * Get available variant options for a product
     * Returns map like: {"color": ["Red", "Blue"], "size": ["S", "M", "L"]}
     */
    Map<String, List<String>> getAvailableVariantOptions(Long productId);

    /**
     * Find variants matching specific options
     */
    List<ProductVariantDto> findVariantsByOptions(Long productId, Map<String, String> options);

    /**
     * Check if variant is available for purchase
     */
    boolean isVariantAvailable(Long variantId, Integer requestedQuantity);

    /**
     * Reserve stock for variant (for order processing)
     */
    boolean reserveVariantStock(Long variantId, Integer quantity);

    /**
     * Release reserved stock for variant (if order is cancelled)
     */
    void releaseVariantStock(Long variantId, Integer quantity);

    /**
     * Get variants with low stock
     */
    List<ProductVariantDto> getLowStockVariants(Integer threshold);

    /**
     * Bulk update variant status
     */
    void updateVariantStatusByProductId(Long productId, String status);

    /**
     * Generate unique SKU for variant
     */
    String generateVariantSku(Long productId, Map<String, String> variantOptions);

    /**
     * Validate variant options
     */
    boolean validateVariantOptions(Map<String, String> options);
}