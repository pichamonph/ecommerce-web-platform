package com.ecommerce.EcommerceApplication.dto;

import java.math.BigDecimal;
import java.util.Map;

import com.ecommerce.EcommerceApplication.entity.Payment.PaymentMethod;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class OmiseCreateChargeReq {

    @NotNull
    public Long orderId;

    @NotNull
    @Positive
    public BigDecimal amount;

    @NotNull
    public String currency = "THB";

    @NotNull
    public PaymentMethod paymentMethod;

    public String description;

    // For credit/debit card payments
    public String token; // Omise token from frontend

    // For TrueMoney payments
    public String phoneNumber;

    // For Internet Banking payments
    public String bankCode; // bay, bbl, ktb, scb, kbank

    // Customer information
    public String customerEmail;
    public String customerName;

    // Additional metadata
    public Map<String, String> metadata;

    // Return URL for 3D Secure and other redirects
    public String returnUrl;

    // Webhook URL (optional, will use default if not provided)
    public String webhookUrl;

    public OmiseCreateChargeReq() {}

    public OmiseCreateChargeReq(Long orderId, BigDecimal amount, PaymentMethod paymentMethod) {
        this.orderId = orderId;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
    }
}