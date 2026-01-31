package com.ecommerce.EcommerceApplication.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Random;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "payment_number", unique = true, nullable = false)
    private String paymentNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "order_id", insertable = false, updatable = false)
    private Long orderId;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(name = "amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(name = "currency", nullable = false)
    private String currency = "THB";

    // Payment Gateway Fields
    @Column(name = "gateway_transaction_id")
    private String gatewayTransactionId;

    @Column(name = "gateway_response", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String gatewayResponse;

    @Column(name = "gateway_fee", precision = 12, scale = 2)
    private BigDecimal gatewayFee = BigDecimal.ZERO;

    // Payment Details (store card info, bank details, etc as JSON)
    @Column(name = "payment_details", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String paymentDetails;

    @Column(name = "failure_reason")
    private String failureReason;

    // Timestamps
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "failed_at")
    private LocalDateTime failedAt;

    @Column(name = "refunded_at")
    private LocalDateTime refundedAt;

    // Payment Methods Enum
    public enum PaymentMethod {
        CREDIT_CARD("Credit Card"),
        DEBIT_CARD("Debit Card"),
        BANK_TRANSFER("Bank Transfer"),
        PROMPTPAY("PromptPay"),
        TRUE_MONEY("TrueMoney Wallet"),
        RABBIT_LINE_PAY("Rabbit LINE Pay"),
        CASH_ON_DELIVERY("Cash on Delivery"),
        PAYPAL("PayPal"),
        STRIPE("Stripe"),
        // Omise specific payment methods
        OMISE_CREDIT_CARD("Omise Credit Card"),
        OMISE_DEBIT_CARD("Omise Debit Card"),
        OMISE_PROMPTPAY("Omise PromptPay"),
        OMISE_TRUEMONEY("Omise TrueMoney"),
        OMISE_INTERNET_BANKING_BAY("Omise Bank of Ayudhya"),
        OMISE_INTERNET_BANKING_BBL("Omise Bangkok Bank"),
        OMISE_INTERNET_BANKING_KTB("Omise Krung Thai Bank"),
        OMISE_INTERNET_BANKING_SCB("Omise Siam Commercial Bank"),
        OMISE_INTERNET_BANKING_KBANK("Omise Kasikorn Bank");

        private final String displayName;

        PaymentMethod(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    // Payment Status Enum
    public enum PaymentStatus {
        PENDING("Pending Payment"),
        PROCESSING("Processing"),
        COMPLETED("Payment Completed"),
        FAILED("Payment Failed"),
        CANCELLED("Payment Cancelled"),
        REFUNDED("Refunded"),
        PARTIALLY_REFUNDED("Partially Refunded");

        private final String displayName;

        PaymentStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    // ===== Constructor =====
    public Payment() {}

    public Payment(Order order, PaymentMethod paymentMethod, BigDecimal amount) {
        this.order = order;
        this.paymentMethod = paymentMethod;
        this.amount = amount;
        this.paymentNumber = generatePaymentNumber();
    }

    // ===== Getters & Setters =====
    public Long getId() { return id; }

    public String getPaymentNumber() { return paymentNumber; }
    public void setPaymentNumber(String paymentNumber) { this.paymentNumber = paymentNumber; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public Long getOrderId() { return orderId; }

    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }

    public PaymentStatus getStatus() { return status; }
    public void setStatus(PaymentStatus status) { this.status = status; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getGatewayTransactionId() { return gatewayTransactionId; }
    public void setGatewayTransactionId(String gatewayTransactionId) { this.gatewayTransactionId = gatewayTransactionId; }

    public String getGatewayResponse() { return gatewayResponse; }
    public void setGatewayResponse(String gatewayResponse) { this.gatewayResponse = gatewayResponse; }

    public BigDecimal getGatewayFee() { return gatewayFee; }
    public void setGatewayFee(BigDecimal gatewayFee) { this.gatewayFee = gatewayFee; }

    public String getPaymentDetails() { return paymentDetails; }
    public void setPaymentDetails(String paymentDetails) { this.paymentDetails = paymentDetails; }

    public String getFailureReason() { return failureReason; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }

    public LocalDateTime getFailedAt() { return failedAt; }
    public void setFailedAt(LocalDateTime failedAt) { this.failedAt = failedAt; }

    public LocalDateTime getRefundedAt() { return refundedAt; }
    public void setRefundedAt(LocalDateTime refundedAt) { this.refundedAt = refundedAt; }

    // ===== Business Methods =====

    /**
     * Mark payment as completed
     */
    public void markAsCompleted(String transactionId) {
        this.status = PaymentStatus.COMPLETED;
        this.gatewayTransactionId = transactionId;
        this.paidAt = LocalDateTime.now();
    }

    /**
     * Mark payment as failed
     */
    public void markAsFailed(String reason) {
        this.status = PaymentStatus.FAILED;
        this.failureReason = reason;
        this.failedAt = LocalDateTime.now();
    }

    /**
     * Mark payment as refunded
     */
    public void markAsRefunded() {
        this.status = PaymentStatus.REFUNDED;
        this.refundedAt = LocalDateTime.now();
    }

    /**
     * Check if payment is successful
     */
    public boolean isCompleted() {
        return PaymentStatus.COMPLETED.equals(this.status);
    }

    /**
     * Check if payment can be refunded
     */
    public boolean canBeRefunded() {
        return PaymentStatus.COMPLETED.equals(this.status);
    }

    /**
     * Generate unique payment number
     * Format: PAY{timestamp}{random6digits}
     * Example: PAY1728234567891234567
     */
    private String generatePaymentNumber() {
        long timestamp = System.currentTimeMillis();
        int random = new Random().nextInt(900000) + 100000; // 6-digit random number (100000-999999)
        return "PAY" + timestamp + random;
    }
}