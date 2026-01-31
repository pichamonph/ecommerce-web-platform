package com.ecommerce.EcommerceApplication.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.ecommerce.EcommerceApplication.entity.Payment.PaymentMethod;
import com.ecommerce.EcommerceApplication.entity.Payment.PaymentStatus;

public class PaymentDto {
    public Long id;
    public String paymentNumber;
    public Long orderId;
    public String orderNumber;

    public PaymentMethod paymentMethod;
    public String paymentMethodDisplayName;

    public PaymentStatus status;
    public String statusDisplayName;

    public BigDecimal amount;
    public String currency;

    public String gatewayTransactionId;
    public BigDecimal gatewayFee;
    public String failureReason;

    public LocalDateTime createdAt;
    public LocalDateTime paidAt;
    public LocalDateTime failedAt;
    public LocalDateTime refundedAt;

    // For frontend display
    public String formattedAmount;
    public boolean canRefund;
    public boolean isCompleted;
}