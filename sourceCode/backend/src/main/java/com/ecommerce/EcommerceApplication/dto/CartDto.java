package com.ecommerce.EcommerceApplication.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class CartDto {
    public Long id;
    public Long userId;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;

    public List<CartItemDto> items;

    public Integer itemCount;   // จำนวนชนิดสินค้าในตะกร้า
    public Integer totalQty;    // ยอดจำนวนรวม
    public BigDecimal subtotal; // ผลรวม lineTotal ทั้งหมด
}
