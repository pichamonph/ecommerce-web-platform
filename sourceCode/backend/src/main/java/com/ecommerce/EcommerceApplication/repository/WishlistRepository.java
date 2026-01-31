package com.ecommerce.EcommerceApplication.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.ecommerce.EcommerceApplication.entity.Wishlist;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    // ดู wishlist ของ user
    Page<Wishlist> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    // ตรวจสอบว่าสินค้านี้อยู่ใน wishlist ของ user หรือไม่
    boolean existsByUserIdAndProduct_Id(Long userId, Long productId);

    // หาและลบ wishlist item
    void deleteByUserIdAndProduct_Id(Long userId, Long productId);

    // นับจำนวน items ใน wishlist ของ user
    long countByUserId(Long userId);

    // ดูสินค้าที่ได้รับความสนใจมากที่สุด (most wishlisted)
    @Query("SELECT w.product.id, COUNT(w) as wishlistCount FROM Wishlist w GROUP BY w.product.id ORDER BY wishlistCount DESC")
    Page<Object[]> findMostWishlistedProducts(Pageable pageable);
}