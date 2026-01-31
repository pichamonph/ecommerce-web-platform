package com.ecommerce.EcommerceApplication.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ProductVariantDto {

    private Long id;
    private Long productId;
    private String sku;
    private String variantTitle;
    private Map<String, String> variantOptions = new HashMap<>();
    private BigDecimal price;
    private BigDecimal comparePrice;
    private BigDecimal effectivePrice;
    private Integer stockQuantity;
    private Integer weightGram;
    private String status;
    private Integer position;
    private boolean available;
    private String displayName;
    private List<String> imageUrls;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // -------- Constructors --------
    public ProductVariantDto() {}

    public ProductVariantDto(Long productId, String sku, Map<String, String> variantOptions,
                           BigDecimal price, Integer stockQuantity) {
        this.productId = productId;
        this.sku = sku;
        this.variantOptions = variantOptions != null ? variantOptions : new HashMap<>();
        this.price = price;
        this.stockQuantity = stockQuantity;
        this.status = "active";
    }

    // -------- Getters/Setters --------

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getVariantTitle() { return variantTitle; }
    public void setVariantTitle(String variantTitle) { this.variantTitle = variantTitle; }

    public Map<String, String> getVariantOptions() { return variantOptions; }
    public void setVariantOptions(Map<String, String> variantOptions) {
        this.variantOptions = variantOptions != null ? variantOptions : new HashMap<>();
    }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public BigDecimal getComparePrice() { return comparePrice; }
    public void setComparePrice(BigDecimal comparePrice) { this.comparePrice = comparePrice; }

    public BigDecimal getEffectivePrice() { return effectivePrice; }
    public void setEffectivePrice(BigDecimal effectivePrice) { this.effectivePrice = effectivePrice; }

    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

    public Integer getWeightGram() { return weightGram; }
    public void setWeightGram(Integer weightGram) { this.weightGram = weightGram; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getPosition() { return position; }
    public void setPosition(Integer position) { this.position = position; }

    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // -------- Helper Methods --------

    /**
     * Get variant option value by key
     */
    public String getVariantOption(String key) {
        return variantOptions.get(key);
    }

    /**
     * Set variant option
     */
    public void setVariantOption(String key, String value) {
        if (variantOptions == null) {
            variantOptions = new HashMap<>();
        }
        variantOptions.put(key, value);
    }

    /**
     * Check if has specific option
     */
    public boolean hasOption(String key) {
        return variantOptions != null && variantOptions.containsKey(key);
    }

    /**
     * Generate display title from options if variantTitle is null
     */
    public String getEffectiveDisplayName() {
        if (displayName != null && !displayName.trim().isEmpty()) {
            return displayName;
        }

        if (variantTitle != null && !variantTitle.trim().isEmpty()) {
            return variantTitle;
        }

        if (variantOptions != null && !variantOptions.isEmpty()) {
            return String.join(" / ", variantOptions.values());
        }

        return "Default";
    }
}