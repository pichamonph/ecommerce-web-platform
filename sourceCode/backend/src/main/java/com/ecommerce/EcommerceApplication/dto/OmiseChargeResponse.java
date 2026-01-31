package com.ecommerce.EcommerceApplication.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

public class OmiseChargeResponse {

    public String chargeId;
    public String status; // pending, successful, failed
    public BigDecimal amount;
    public String currency;
    public String description;
    public boolean paid;
    public LocalDateTime createdAt;
    public LocalDateTime paidAt;

    // For 3D Secure and redirects
    public String authorizeUri;
    public boolean requiresAction;

    // Payment source information
    public String paymentMethod;
    public String last4; // For card payments
    public String brand; // For card payments
    public String bankCode; // For internet banking

    // QR Code data for PromptPay
    public String qrCodeData;
    public String qrCodeImageUrl;

    // Failure information
    public String failureCode;
    public String failureMessage;

    // Transaction fees
    public BigDecimal fee;
    public BigDecimal net;

    // Reference IDs
    public String referenceNumber;
    public String transactionId;

    // Metadata
    public Map<String, String> metadata;

    public OmiseChargeResponse() {}

    public OmiseChargeResponse(String chargeId, String status, BigDecimal amount, String currency) {
        this.chargeId = chargeId;
        this.status = status;
        this.amount = amount;
        this.currency = currency;
    }
}