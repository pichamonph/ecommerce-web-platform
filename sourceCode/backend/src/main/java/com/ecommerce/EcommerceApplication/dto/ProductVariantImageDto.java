package com.ecommerce.EcommerceApplication.dto;

import java.time.LocalDateTime;

public class ProductVariantImageDto {

    private Long id;
    private Long variantId;
    private String imageUrl;
    private String altText;
    private Integer position;
    private LocalDateTime createdAt;

    // -------- Constructors --------
    public ProductVariantImageDto() {}

    public ProductVariantImageDto(Long variantId, String imageUrl, String altText, Integer position) {
        this.variantId = variantId;
        this.imageUrl = imageUrl;
        this.altText = altText;
        this.position = position;
    }

    // -------- Getters/Setters --------

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getVariantId() { return variantId; }
    public void setVariantId(Long variantId) { this.variantId = variantId; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getAltText() { return altText; }
    public void setAltText(String altText) { this.altText = altText; }

    public Integer getPosition() { return position; }
    public void setPosition(Integer position) { this.position = position; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}