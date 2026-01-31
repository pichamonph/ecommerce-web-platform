package com.ecommerce.EcommerceApplication.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "product_variants")
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", insertable = false, updatable = false)
    private Long productId;

    @Column(name = "sku", unique = true, nullable = false)
    private String sku;

    @Column(name = "variant_title")
    private String variantTitle; // e.g., "Red / Large", "iPhone 15 Pro / 256GB / Space Black"

    // Variant options stored as JSON (flexible approach)
    // Example: {"color": "Red", "size": "Large", "storage": "256GB"}
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "variant_options", columnDefinition = "jsonb")
    private Map<String, String> variantOptions = new HashMap<>();

    @Column(name = "price", precision = 12, scale = 2)
    private BigDecimal price; // If null, use parent product price

    @Column(name = "compare_price", precision = 12, scale = 2)
    private BigDecimal comparePrice;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 0;

    @Column(name = "weight_gram")
    private Integer weightGram;

    @Column(name = "status")
    private String status = "active"; // active, inactive, out_of_stock

    @Column(name = "position") // For ordering variants
    private Integer position;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // -------- Relationships --------

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonBackReference("product-variants")
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // Variant-specific images
    @OneToMany(mappedBy = "variant", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("variant-images")
    private List<ProductVariantImage> images = new ArrayList<>();

    // -------- Constructors --------
    public ProductVariant() {}

    public ProductVariant(Product product, String sku, String variantTitle,
                         Map<String, String> variantOptions, Integer stockQuantity) {
        this.product = product;
        this.sku = sku;
        this.variantTitle = variantTitle;
        this.variantOptions = variantOptions != null ? variantOptions : new HashMap<>();
        this.stockQuantity = stockQuantity;
    }

    // -------- Business Methods --------

    /**
     * Get effective price (variant price or parent product price)
     */
    @JsonIgnore
    public BigDecimal getEffectivePrice() {
        if (price != null) {
            return price;
        }
        return product != null ? product.getPrice() : BigDecimal.ZERO;
    }

    /**
     * Get variant option value by key (e.g., "color", "size")
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
     * Check if variant is available for purchase
     */
    public boolean isAvailable() {
        return "active".equals(status) && stockQuantity != null && stockQuantity > 0;
    }

    /**
     * Generate display name for variant
     */
    public String getDisplayName() {
        if (variantTitle != null && !variantTitle.trim().isEmpty()) {
            return variantTitle;
        }

        // Auto-generate from options
        if (variantOptions != null && !variantOptions.isEmpty()) {
            return String.join(" / ", variantOptions.values());
        }

        return "Default";
    }

    // -------- Image Management --------

    public void addImage(ProductVariantImage image) {
        if (image == null) return;
        image.setVariant(this);
        this.images.add(image);
    }

    public void removeImage(ProductVariantImage image) {
        if (image == null) return;
        this.images.remove(image);
        image.setVariant(null);
    }

    // -------- Getters/Setters --------

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductId() { return productId; }

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

    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

    public Integer getWeightGram() { return weightGram; }
    public void setWeightGram(Integer weightGram) { this.weightGram = weightGram; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getPosition() { return position; }
    public void setPosition(Integer position) { this.position = position; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public List<ProductVariantImage> getImages() { return images; }
    public void setImages(List<ProductVariantImage> images) {
        this.images.clear();
        if (images != null) {
            for (ProductVariantImage image : images) {
                addImage(image);
            }
        }
    }
}