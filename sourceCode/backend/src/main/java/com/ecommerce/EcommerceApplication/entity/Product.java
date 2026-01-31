package com.ecommerce.EcommerceApplication.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonBackReference;
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
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "shop_id")
    private Long shopId;

    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "slug", unique = true, nullable = false)
    private String slug;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "price", precision = 12, scale = 2, nullable = false)
    private BigDecimal price;

    @Column(name = "compare_price", precision = 12, scale = 2)
    private BigDecimal comparePrice;

    @Column(name = "sku", unique = true)
    private String sku;

    @Column(name = "stock_quantity")
    private Integer stockQuantity = 0;

    @Column(name = "weight_gram")
    private Integer weightGram;

    @Column(name = "status")
    private String status = "active";

    @Column(name = "rating_avg", precision = 3, scale = 2)
    private BigDecimal ratingAvg = BigDecimal.ZERO;

    @Column(name = "rating_count")
    private Integer ratingCount = 0;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // -------- Relationships --------

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonBackReference("shop-products")
    @JoinColumn(name = "shop_id", insertable = false, updatable = false)
    private Shop shop;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", insertable = false, updatable = false)
    @JsonBackReference("category-products")
    private Category category;

    // Product images (ordered list)
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("product-images")
    private List<ProductImage> images = new ArrayList<>();

   

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Review> reviews = new HashSet<>();

    // Product variants
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("product-variants")
    private List<ProductVariant> variants = new ArrayList<>();



    // -------- Constructors --------
    public Product() {}

    public Product(String name, String slug, String description, Long shopId, Long categoryId) {
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.shopId = shopId;
        this.categoryId = categoryId;
    }

    // -------- Getters/Setters --------
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getShopId() { return shopId; }
    public void setShopId(Long shopId) { this.shopId = shopId; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public BigDecimal getComparePrice() { return comparePrice; }
    public void setComparePrice(BigDecimal comparePrice) { this.comparePrice = comparePrice; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

    public Integer getWeightGram() { return weightGram; }
    public void setWeightGram(Integer weightGram) { this.weightGram = weightGram; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public BigDecimal getRatingAvg() { return ratingAvg; }
    public void setRatingAvg(BigDecimal ratingAvg) { this.ratingAvg = ratingAvg; }

    public Integer getRatingCount() { return ratingCount; }
    public void setRatingCount(Integer ratingCount) { this.ratingCount = ratingCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Shop getShop() { return shop; }
    public void setShop(Shop shop) { this.shop = shop; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public Product getProduct() { return product; }
public void setProduct(Product product) { this.product = product; }

    public List<ProductImage> getImages() { return images; }
    public void setImages(List<ProductImage> imgs) {
        this.images.clear();
        if (imgs != null) {
            for (ProductImage img : imgs) {
                addImage(img);
            }
        }
    }

    // Convenience methods for relationship handling
    public void addImage(ProductImage img) {
        if (img == null) return;
        img.setProduct(this);
        this.images.add(img);
    }

    public void removeImage(ProductImage img) {
        if (img == null) return;
        this.images.remove(img);
        img.setProduct(null);
    }

    

    public Set<Review> getReviews() { return reviews; }
    public void setReviews(Set<Review> reviews) { this.reviews = reviews; }

    public List<ProductVariant> getVariants() { return variants; }
    public void setVariants(List<ProductVariant> variants) {
        this.variants.clear();
        if (variants != null) {
            for (ProductVariant variant : variants) {
                addVariant(variant);
            }
        }
    }

    // -------- Variant Management Methods --------

    public void addVariant(ProductVariant variant) {
        if (variant == null) return;
        variant.setProduct(this);
        this.variants.add(variant);
    }

    public void removeVariant(ProductVariant variant) {
        if (variant == null) return;
        this.variants.remove(variant);
        variant.setProduct(null);
    }

    /**
     * Check if product has variants
     */
    public boolean hasVariants() {
        return variants != null && !variants.isEmpty();
    }

    /**
     * Get total stock from all variants (if has variants) or own stock
     */
    public Integer getTotalStock() {
        if (hasVariants()) {
            return variants.stream()
                .filter(v -> "active".equals(v.getStatus()))
                .mapToInt(v -> v.getStockQuantity() != null ? v.getStockQuantity() : 0)
                .sum();
        }
        return stockQuantity != null ? stockQuantity : 0;
    }

    /**
     * Get minimum price from variants or own price
     */
    public BigDecimal getMinPrice() {
        if (hasVariants()) {
            return variants.stream()
                .filter(v -> "active".equals(v.getStatus()))
                .map(ProductVariant::getEffectivePrice)
                .min(BigDecimal::compareTo)
                .orElse(price);
        }
        return price;
    }

    /**
     * Get maximum price from variants or own price
     */
    public BigDecimal getMaxPrice() {
        if (hasVariants()) {
            return variants.stream()
                .filter(v -> "active".equals(v.getStatus()))
                .map(ProductVariant::getEffectivePrice)
                .max(BigDecimal::compareTo)
                .orElse(price);
        }
        return price;
    }

    /**
     * Check if product is available for purchase
     */
    public boolean isAvailable() {
        if (!status.equals("active")) {
            return false;
        }

        if (hasVariants()) {
            return variants.stream()
                .anyMatch(ProductVariant::isAvailable);
        }

        return stockQuantity != null && stockQuantity > 0;
    }
}
