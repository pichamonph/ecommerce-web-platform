package com.ecommerce.EcommerceApplication.dto;

public class AddToCartReq {

    private Long productId;
    private Long variantId; // Optional - for variant products
    private Integer quantity;

    // -------- Constructors --------
    public AddToCartReq() {}

    public AddToCartReq(Long productId, Integer quantity) {
        this.productId = productId;
        this.quantity = quantity;
    }

    public AddToCartReq(Long productId, Long variantId, Integer quantity) {
        this.productId = productId;
        this.variantId = variantId;
        this.quantity = quantity;
    }

    // -------- Getters/Setters --------

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public Long getVariantId() { return variantId; }
    public void setVariantId(Long variantId) { this.variantId = variantId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    // -------- Helper Methods --------

    public boolean hasVariant() {
        return variantId != null;
    }

    public boolean isValid() {
        return productId != null && quantity != null && quantity > 0;
    }
}