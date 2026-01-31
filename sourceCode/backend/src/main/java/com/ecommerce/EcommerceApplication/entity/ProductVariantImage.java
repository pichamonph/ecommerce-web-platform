package com.ecommerce.EcommerceApplication.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonBackReference;

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
@Table(name = "product_variant_images")
public class ProductVariantImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "variant_id", insertable = false, updatable = false)
    private Long variantId;

    @Column(name = "image_url", nullable = false, length = 1000)
    private String imageUrl;

    @Column(name = "alt_text", length = 500)
    private String altText;

    @Column(name = "position")
    private Integer position = 0;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // -------- Relationships --------
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonBackReference("variant-images")
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    // -------- Constructors --------
    public ProductVariantImage() {}

    public ProductVariantImage(ProductVariant variant, String imageUrl, String altText, Integer position) {
        this.variant = variant;
        this.imageUrl = imageUrl;
        this.altText = altText;
        this.position = position;
    }

    // -------- Getters/Setters --------
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getVariantId() { return variantId; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getAltText() { return altText; }
    public void setAltText(String altText) { this.altText = altText; }

    public Integer getPosition() { return position; }
    public void setPosition(Integer position) { this.position = position; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public ProductVariant getVariant() { return variant; }
    public void setVariant(ProductVariant variant) { this.variant = variant; }
}