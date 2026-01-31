package com.ecommerce.EcommerceApplication.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ecommerce.EcommerceApplication.entity.Order;
import com.ecommerce.EcommerceApplication.entity.OrderStatus;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);
    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    List<Order> findByUserIdAndStatus(Long userId, OrderStatus status);

    // For Seller: Query orders that have items from this shop
    @Query("SELECT DISTINCT o FROM Order o " +
           "JOIN o.items oi " +
           "WHERE oi.shopId = :shopId " +
           "ORDER BY o.createdAt DESC")
    Page<Order> findByShopId(@Param("shopId") Long shopId, Pageable pageable);

    // For Seller: Query orders by shop and status
    @Query("SELECT DISTINCT o FROM Order o " +
           "JOIN o.items oi " +
           "WHERE oi.shopId = :shopId AND o.status = :status " +
           "ORDER BY o.createdAt DESC")
    Page<Order> findByShopIdAndStatus(
        @Param("shopId") Long shopId,
        @Param("status") OrderStatus status,
        Pageable pageable
    );

    // For Seller: Count orders by shop
    @Query("SELECT COUNT(DISTINCT o) FROM Order o JOIN o.items oi WHERE oi.shopId = :shopId")
    long countByShopId(@Param("shopId") Long shopId);

    // For Seller: Count orders by shop and status
    @Query("SELECT COUNT(DISTINCT o) FROM Order o JOIN o.items oi WHERE oi.shopId = :shopId AND o.status = :status")
    long countByShopIdAndStatus(@Param("shopId") Long shopId, @Param("status") OrderStatus status);
}
