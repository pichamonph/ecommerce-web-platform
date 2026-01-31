package com.ecommerce.EcommerceApplication.dto;

import java.time.LocalDateTime;

public class WishlistDto {
    public Long id;
    public Long userId;
    public ProductDto product;
    public LocalDateTime createdAt;
}