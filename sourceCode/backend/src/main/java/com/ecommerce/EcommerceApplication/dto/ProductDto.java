package com.ecommerce.EcommerceApplication.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class ProductDto {
    public Long id;
    public Long shopId;
    public Long categoryId;
    public String name;
    public String slug;
    public String description;
    public java.math.BigDecimal price;
    public java.math.BigDecimal comparePrice;
    public String sku;
    public Integer stockQuantity;
    public Integer weightGram;
    public String status;
    public BigDecimal ratingAvg;
    public Integer ratingCount;
    public LocalDateTime createdAt;

    public List<ProductImageDto> images;
    public List<ProductVariantDto> variants;

    // Variant-related fields
    public boolean hasVariants;
    public BigDecimal minPrice;
    public BigDecimal maxPrice;
    public Integer totalStock;
}


