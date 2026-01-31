package com.ecommerce.EcommerceApplication.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ecommerce.EcommerceApplication.entity.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    // ของเดิม
    List<OrderItem> findByOrderId(Long orderId);

    // ✅ เมธอดช่วยตรวจว่า orderItemId นี้ เป็นของ userId และ productId นี้จริงหรือไม่
    @Query("""
        select (count(oi) > 0) from OrderItem oi
          join oi.order o
         where oi.id = :orderItemId
           and oi.productId = :productId
           and o.userId = :userId
    """)
    boolean isOrderItemOwned(@Param("orderItemId") Long orderItemId,
                             @Param("productId") Long productId,
                             @Param("userId") Long userId);

    // สะดวกเวลาใช้ Optional (ไม่บังคับ)
    Optional<OrderItem> findById(Long id);

    // (ออปชัน) สำหรับฝั่ง Seller เอารายการของร้านตัวเอง
    List<OrderItem> findByShopId(Long shopId);
}
