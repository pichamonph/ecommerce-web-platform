package com.ecommerce.EcommerceApplication.dto;

import java.math.BigDecimal;
import java.util.List;

public class CreateProductRequest {
    public String name;
    public String description;
    public BigDecimal price;
    public BigDecimal comparePrice;
    public String sku;
    public Integer stockQuantity;
    public Integer weightGram;
    public String status; // active, inactive
    public Long categoryId;
    public List<String> imageUrls; // URLs of product images
}
