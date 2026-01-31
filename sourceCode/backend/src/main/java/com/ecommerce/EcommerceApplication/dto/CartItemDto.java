package com.ecommerce.EcommerceApplication.dto;

import java.math.BigDecimal;
import java.util.Map;

public class CartItemDto {
    public Long id;
    public Long productId;
    public String productName;
    public String productSku;
    public String productImage;    // รูปสินค้า

    public BigDecimal unitPrice;   // = priceSnapshot
    public Integer quantity;
    public BigDecimal lineTotal;   // unitPrice * quantity
    public Integer stock;          // จำนวนคงเหลือ

    // Variant-related fields
    public Long variantId;
    public String variantSku;
    public String variantTitle;
    public Map<String, String> variantOptions;  // JSON options
    public String effectiveSku;    // variantSku if available, otherwise productSku

    // Shop information
    public Long shopId;
    public String shopName;
}
