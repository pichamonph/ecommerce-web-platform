package com.ecommerce.EcommerceApplication.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ecommerce.EcommerceApplication.entity.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByProduct_IdOrderByCreatedAtDesc(Long productId, Pageable pageable);

    Long countByProduct_Id(Long productId);

    @Query("select coalesce(avg(r.rating),0) from Review r where r.product.id = :productId")
    Double avgRatingByProduct(Long productId);

    // เพิ่มเมธอดตรวจสอบรีวิวซ้ำ
    boolean existsByUserIdAndOrderItemId(Long userId, Long orderItemId);

    // เพิ่มเมธอดตรวจสอบรีวิวซ้ำสำหรับ product (กรณีไม่มี orderItemId)
    boolean existsByUserIdAndProduct_Id(Long userId, Long productId);

    // For Seller: Get reviews by shop
    @Query("SELECT r FROM Review r " +
           "JOIN r.product p " +
           "WHERE p.shopId = :shopId " +
           "ORDER BY r.createdAt DESC")
    Page<Review> findByShopId(@Param("shopId") Long shopId, Pageable pageable);
}