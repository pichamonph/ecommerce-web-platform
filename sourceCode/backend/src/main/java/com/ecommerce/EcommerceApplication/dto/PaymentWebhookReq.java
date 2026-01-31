package com.ecommerce.EcommerceApplication.dto;

import java.math.BigDecimal;

/**
 * DTO for receiving webhook notifications from payment gateways
 */
public class PaymentWebhookReq {

    // Common fields for most payment gateways
    public String transactionId;
    public String paymentNumber;
    public String status; // success, failed, pending, cancelled
    public BigDecimal amount;
    public String currency;

    // Gateway-specific fields
    public String gatewayName;
    public String gatewayTransactionId;
    public String gatewayStatus;
    public String signature; // for webhook verification

    // Additional data from gateway
    public String rawData; // Store complete webhook payload
    public String failureReason;
    public BigDecimal gatewayFee;

    // Metadata
    public String eventType; // payment.success, payment.failed, etc.
    public String timestamp;
}