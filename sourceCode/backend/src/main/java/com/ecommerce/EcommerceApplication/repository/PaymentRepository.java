package com.ecommerce.EcommerceApplication.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ecommerce.EcommerceApplication.entity.Payment;
import com.ecommerce.EcommerceApplication.entity.Payment.PaymentStatus;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    /**
     * Find payment by payment number
     */
    Optional<Payment> findByPaymentNumber(String paymentNumber);

    /**
     * Find payment by gateway transaction ID
     */
    Optional<Payment> findByGatewayTransactionId(String gatewayTransactionId);

    /**
     * Find all payments for a specific order
     */
    List<Payment> findByOrderIdOrderByCreatedAtDesc(Long orderId);

    /**
     * Find payments by order ID and status
     */
    List<Payment> findByOrderIdAndStatus(Long orderId, PaymentStatus status);

    /**
     * Find payments by status
     */
    Page<Payment> findByStatus(PaymentStatus status, Pageable pageable);

    /**
     * Find payments by user (through order relationship)
     */
    @Query("SELECT p FROM Payment p JOIN p.order o WHERE o.userId = :userId ORDER BY p.createdAt DESC")
    Page<Payment> findByUserId(@Param("userId") Long userId, Pageable pageable);

    /**
     * Find pending payments older than specified time (for cleanup/timeout)
     */
    @Query("SELECT p FROM Payment p WHERE p.status = 'PENDING' AND p.createdAt < :cutoffTime")
    List<Payment> findPendingPaymentsOlderThan(@Param("cutoffTime") LocalDateTime cutoffTime);

    /**
     * Find successful payments for an order
     */
    @Query("SELECT p FROM Payment p WHERE p.orderId = :orderId AND p.status = 'COMPLETED'")
    List<Payment> findCompletedPaymentsByOrderId(@Param("orderId") Long orderId);

    /**
     * Get total amount paid for an order
     */
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.orderId = :orderId AND p.status = 'COMPLETED'")
    Double getTotalPaidAmountByOrderId(@Param("orderId") Long orderId);

    /**
     * Find payments by payment method
     */
    Page<Payment> findByPaymentMethod(Payment.PaymentMethod paymentMethod, Pageable pageable);

    /**
     * Find payments created between dates
     */
    @Query("SELECT p FROM Payment p WHERE p.createdAt BETWEEN :startDate AND :endDate ORDER BY p.createdAt DESC")
    Page<Payment> findPaymentsBetweenDates(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        Pageable pageable
    );

    /**
     * Count payments by status for dashboard
     */
    @Query("SELECT p.status, COUNT(p) FROM Payment p GROUP BY p.status")
    List<Object[]> countPaymentsByStatus();

    /**
     * Check if order has any successful payment
     */
    @Query("SELECT COUNT(p) > 0 FROM Payment p WHERE p.orderId = :orderId AND p.status = 'COMPLETED'")
    boolean hasCompletedPayment(@Param("orderId") Long orderId);

    /**
     * Find latest payment for order
     */
    Optional<Payment> findTopByOrderIdOrderByCreatedAtDesc(Long orderId);
}