package com.ecommerce.EcommerceApplication.dto;

import java.math.BigDecimal;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import com.ecommerce.EcommerceApplication.entity.Payment.PaymentMethod;

public class CreatePaymentReq {

    @NotNull(message = "Order ID is required")
    public Long orderId;

    @NotNull(message = "Payment method is required")
    public PaymentMethod paymentMethod;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    public BigDecimal amount;

    public String currency = "THB";

    // Payment-specific details (card info, bank account, etc.)
    // This should be encrypted/tokenized in real implementation
    public String paymentDetails;

    // For future gateway integration
    public String returnUrl;
    public String cancelUrl;
}