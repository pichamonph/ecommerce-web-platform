package com.ecommerce.EcommerceApplication.service;

import com.ecommerce.EcommerceApplication.dto.WishlistDto;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface WishlistService {
    // เพิ่มสินค้าเข้า wishlist
    WishlistDto addToWishlist(Long userId, Long productId);

    // ลบสินค้าออกจาก wishlist
    boolean removeFromWishlist(Long userId, Long productId);

    // ดู wishlist ของ user
    Page<WishlistDto> getUserWishlist(Long userId, Pageable pageable);

    // ตรวจสอบว่าสินค้าอยู่ใน wishlist หรือไม่
    boolean isInWishlist(Long userId, Long productId);

    // นับจำนวน items ใน wishlist
    long getWishlistCount(Long userId);

    // ดูสินค้าที่ได้รับความสนใจมากที่สุด
    Page<Object[]> getMostWishlistedProducts(Pageable pageable);
}