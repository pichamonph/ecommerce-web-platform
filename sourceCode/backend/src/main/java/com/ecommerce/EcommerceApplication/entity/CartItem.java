package com.ecommerce.EcommerceApplication.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "cart_items")
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // อ่านค่า ID ได้โดยไม่ต้องโหลด relation (read-only shadow columns)
    @Column(name = "cart_id", insertable = false, updatable = false)
    private Long cartId;

    @Column(name = "product_id", insertable = false, updatable = false)
    private Long productId;

    @Column(name = "variant_id", insertable = false, updatable = false)
    private Long variantId;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "price_snapshot", precision = 12, scale = 2, nullable = false)
    private BigDecimal priceSnapshot;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false, insertable = false)
    private LocalDateTime createdAt;

    // -------- Relationships (owning side) --------
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id")
    private ProductVariant variant;

    // -------- Constructors --------
    public CartItem() {}

    public CartItem(Cart cart, Product product, Integer quantity, BigDecimal priceSnapshot) {
        this.cart = cart;
        this.product = product;
        this.quantity = quantity;
        this.priceSnapshot = priceSnapshot;
    }

    public CartItem(Cart cart, Product product, ProductVariant variant, Integer quantity, BigDecimal priceSnapshot) {
        this.cart = cart;
        this.product = product;
        this.variant = variant;
        this.quantity = quantity;
        this.priceSnapshot = priceSnapshot;
    }

    // -------- Getters/Setters --------
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCartId() { return cartId; } // read-only
    public Long getProductId() { return productId; } // read-only
    public Long getVariantId() { return variantId; } // read-only

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public BigDecimal getPriceSnapshot() { return priceSnapshot; }
    public void setPriceSnapshot(BigDecimal priceSnapshot) { this.priceSnapshot = priceSnapshot; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public Cart getCart() { return cart; }
    public void setCart(Cart cart) { this.cart = cart; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public ProductVariant getVariant() { return variant; }
    public void setVariant(ProductVariant variant) { this.variant = variant; }

    // -------- Business helpers --------
    public BigDecimal getTotalPrice() {
        int qty = (quantity == null) ? 0 : quantity;
        BigDecimal price = (priceSnapshot == null) ? BigDecimal.ZERO : priceSnapshot;
        return price.multiply(BigDecimal.valueOf(qty));
    }

    /**
     * Get display name for cart item (includes variant info if applicable)
     */
    public String getDisplayName() {
        String productName = product != null ? product.getName() : "Unknown Product";
        if (variant != null) {
            return productName + " - " + variant.getDisplayName();
        }
        return productName;
    }

    /**
     * Get the effective SKU (variant SKU if available, otherwise product SKU)
     */
    public String getEffectiveSku() {
        if (variant != null) {
            return variant.getSku();
        }
        return product != null ? product.getSku() : null;
    }

    /**
     * Check if this cart item represents a variant
     */
    public boolean hasVariant() {
        return variant != null;
    }
}
