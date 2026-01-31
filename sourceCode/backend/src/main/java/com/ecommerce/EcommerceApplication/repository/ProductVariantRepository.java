package com.ecommerce.EcommerceApplication.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ecommerce.EcommerceApplication.entity.ProductVariant;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    /**
     * Find all variants for a specific product
     */
    List<ProductVariant> findByProductIdOrderByPositionAsc(Long productId);

    /**
     * Find all active variants for a specific product
     */
    List<ProductVariant> findByProductIdAndStatusOrderByPositionAsc(Long productId, String status);

    /**
     * Find variant by SKU
     */
    Optional<ProductVariant> findBySku(String sku);

    /**
     * Find variants by product ID with images
     */
    @Query("SELECT DISTINCT v FROM ProductVariant v " +
           "LEFT JOIN FETCH v.images i " +
           "WHERE v.product.id = :productId " +
           "ORDER BY v.position ASC, i.position ASC")
    List<ProductVariant> findByProductIdWithImages(@Param("productId") Long productId);

    /**
     * Find variants by product ID and specific variant option
     */
    @Query("SELECT v FROM ProductVariant v " +
           "WHERE v.product.id = ?1 " +
           "AND CAST(v.variantOptions AS string) LIKE CONCAT('%', ?2, '%') " +
           "ORDER BY v.position ASC")
    List<ProductVariant> findByProductIdAndVariantOption(Long productId, String optionValue);

    /**
     * Find variants with stock above threshold
     */
    @Query("SELECT v FROM ProductVariant v " +
           "WHERE v.product.id = ?1 " +
           "AND v.status = 'active' " +
           "AND v.stockQuantity > ?2 " +
           "ORDER BY v.position ASC")
    List<ProductVariant> findAvailableVariantsByProductId(Long productId, Integer minStock);

    /**
     * Count variants by product ID
     */
    long countByProductId(Long productId);

    /**
     * Count active variants by product ID
     */
    long countByProductIdAndStatus(Long productId, String status);

    /**
     * Find variants by multiple variant options using JSON query
     */
    @Query(value = "SELECT * FROM product_variants v " +
                   "WHERE v.product_id = ?1 " +
                   "AND v.variant_options @> CAST(?2 AS jsonb) " +
                   "ORDER BY v.position ASC",
           nativeQuery = true)
    List<ProductVariant> findByProductIdAndVariantOptions(Long productId, String options);

    /**
     * Get distinct option keys for a product (e.g., ["color", "size", "storage"])
     */
    @Query(value = "SELECT DISTINCT jsonb_object_keys(variant_options) as option_key " +
                   "FROM product_variants " +
                   "WHERE product_id = ?1 " +
                   "AND status = 'active'",
           nativeQuery = true)
    List<String> getDistinctOptionKeysByProductId(Long productId);

    /**
     * Get distinct option values for a specific option key
     */
    @Query(value = "SELECT DISTINCT variant_options->>?2 as option_value " +
                   "FROM product_variants " +
                   "WHERE product_id = ?1 " +
                   "AND status = 'active' " +
                   "AND jsonb_exists(variant_options, ?2) " +
                   "ORDER BY option_value",
           nativeQuery = true)
    List<String> getDistinctOptionValuesByProductIdAndKey(Long productId, String optionKey);

    /**
     * Update stock quantity for a variant
     */
    @Modifying
    @Query("UPDATE ProductVariant v SET v.stockQuantity = ?2 WHERE v.id = ?1")
    int updateStockQuantity(Long variantId, Integer stockQuantity);

    /**
     * Find variants with low stock
     */
    @Query("SELECT v FROM ProductVariant v " +
           "WHERE v.status = 'active' " +
           "AND v.stockQuantity <= ?1 " +
           "ORDER BY v.stockQuantity ASC")
    List<ProductVariant> findLowStockVariants(Integer threshold);

    /**
     * Bulk update variant status
     */
    @Modifying
    @Query("UPDATE ProductVariant v SET v.status = ?2 WHERE v.product.id = ?1")
    int updateStatusByProductId(Long productId, String status);
}