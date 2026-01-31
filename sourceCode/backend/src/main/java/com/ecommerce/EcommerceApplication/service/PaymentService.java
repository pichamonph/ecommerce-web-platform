package com.ecommerce.EcommerceApplication.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.ecommerce.EcommerceApplication.dto.CreatePaymentReq;
import com.ecommerce.EcommerceApplication.dto.PaymentDto;
import com.ecommerce.EcommerceApplication.dto.PaymentWebhookReq;
import com.ecommerce.EcommerceApplication.entity.Payment.PaymentMethod;
import com.ecommerce.EcommerceApplication.entity.Payment.PaymentStatus;

public interface PaymentService {

    /**
     * Create a new payment for an order
     */
    PaymentDto createPayment(CreatePaymentReq req);

    /**
     * Process payment through gateway
     */
    PaymentDto processPayment(Long paymentId, String gatewayData);

    /**
     * Get payment by ID
     */
    PaymentDto getPaymentById(Long paymentId);

    /**
     * Get payment by payment number
     */
    PaymentDto getPaymentByNumber(String paymentNumber);

    /**
     * Get payment by gateway transaction ID (Omise charge ID)
     */
    PaymentDto getPaymentByGatewayTransactionId(String gatewayTransactionId);

    /**
     * Get payments for a specific order
     */
    List<PaymentDto> getPaymentsByOrderId(Long orderId);

    /**
     * Get payments for a user (through orders)
     */
    Page<PaymentDto> getPaymentsByUserId(Long userId, Pageable pageable);

    /**
     * Get payments by status
     */
    Page<PaymentDto> getPaymentsByStatus(PaymentStatus status, Pageable pageable);

    /**
     * Update payment status manually (admin function)
     */
    PaymentDto updatePaymentStatus(Long paymentId, PaymentStatus newStatus, String reason);

    /**
     * Handle webhook from payment gateway
     */
    void handlePaymentWebhook(PaymentWebhookReq webhookData);

    /**
     * Mark payment as completed
     */
    PaymentDto completePayment(Long paymentId, String transactionId);

    /**
     * Mark payment as failed
     */
    PaymentDto failPayment(Long paymentId, String reason);

    /**
     * Refund a payment
     */
    PaymentDto refundPayment(Long paymentId, BigDecimal refundAmount, String reason);

    /**
     * Cancel pending payment
     */
    PaymentDto cancelPayment(Long paymentId, String reason);

    /**
     * Check if order is fully paid
     */
    boolean isOrderFullyPaid(Long orderId);

    /**
     * Get total paid amount for order
     */
    BigDecimal getTotalPaidAmount(Long orderId);

    /**
     * Get supported payment methods
     */
    List<PaymentMethod> getSupportedPaymentMethods();

    /**
     * Cleanup expired pending payments (scheduled task)
     */
    void cleanupExpiredPayments();

    /**
     * Get payment statistics for dashboard
     */
    PaymentStats getPaymentStatistics();

    /**
     * Inner class for payment statistics
     */
    class PaymentStats {
        public Long totalPayments;
        public Long pendingPayments;
        public Long completedPayments;
        public Long failedPayments;
        public BigDecimal totalAmount;
        public BigDecimal totalRevenue;
    }
}