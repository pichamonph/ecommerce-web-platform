package com.ecommerce.EcommerceApplication.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ecommerce.EcommerceApplication.entity.OrderStatus;
import com.ecommerce.EcommerceApplication.entity.OrderStatusHistory;

@Repository
public interface OrderStatusHistoryRepository extends JpaRepository<OrderStatusHistory, Long> {

    /**
     * Find all status history for a specific order, ordered by creation time
     */
    List<OrderStatusHistory> findByOrderIdOrderByCreatedAtDesc(Long orderId);

    /**
     * Find all status history for a specific order with pagination
     */
    Page<OrderStatusHistory> findByOrderIdOrderByCreatedAtDesc(Long orderId, Pageable pageable);

    /**
     * Find the most recent status change for an order
     */
    @Query("SELECT h FROM OrderStatusHistory h WHERE h.order.id = :orderId ORDER BY h.createdAt DESC LIMIT 1")
    OrderStatusHistory findLatestByOrderId(@Param("orderId") Long orderId);

    /**
     * Find status history by order and status
     */
    List<OrderStatusHistory> findByOrderIdAndNewStatusOrderByCreatedAtDesc(Long orderId, OrderStatus status);

    /**
     * Find all status changes made by a specific user
     */
    List<OrderStatusHistory> findByChangedByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Find all automatic status changes
     */
    List<OrderStatusHistory> findByAutomaticChangeTrueOrderByCreatedAtDesc();

    /**
     * Find all manual status changes
     */
    List<OrderStatusHistory> findByAutomaticChangeFalseOrderByCreatedAtDesc();

    /**
     * Find status history within a date range
     */
    List<OrderStatusHistory> findByCreatedAtBetweenOrderByCreatedAtDesc(
        LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Find status history for orders with specific status transitions
     */
    @Query("SELECT h FROM OrderStatusHistory h WHERE h.previousStatus = :fromStatus AND h.newStatus = :toStatus ORDER BY h.createdAt DESC")
    List<OrderStatusHistory> findByStatusTransition(
        @Param("fromStatus") OrderStatus fromStatus,
        @Param("toStatus") OrderStatus toStatus);

    /**
     * Count status changes for an order
     */
    Long countByOrderId(Long orderId);

    /**
     * Find orders that were changed by a specific role
     */
    List<OrderStatusHistory> findByChangedByRoleOrderByCreatedAtDesc(String role);

    /**
     * Find status changes with specific external reference
     */
    List<OrderStatusHistory> findByExternalReferenceOrderByCreatedAtDesc(String externalReference);

    /**
     * Get status history statistics for dashboard
     */
    @Query("SELECT h.newStatus as status, COUNT(h) as count FROM OrderStatusHistory h " +
           "WHERE h.createdAt >= :fromDate GROUP BY h.newStatus")
    List<Object[]> getStatusChangeStatistics(@Param("fromDate") LocalDateTime fromDate);

    /**
     * Find recent status changes for admin dashboard
     */
    @Query("SELECT h FROM OrderStatusHistory h ORDER BY h.createdAt DESC LIMIT :limit")
    List<OrderStatusHistory> findRecentStatusChanges(@Param("limit") int limit);

    /**
     * Check if an order has ever had a specific status
     */
    boolean existsByOrderIdAndNewStatus(Long orderId, OrderStatus status);
}