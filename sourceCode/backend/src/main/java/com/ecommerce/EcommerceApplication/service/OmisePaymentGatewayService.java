package com.ecommerce.EcommerceApplication.service;

import java.math.BigDecimal;
import java.util.Map;

import com.ecommerce.EcommerceApplication.model.omise.OmiseCharge;

public interface OmisePaymentGatewayService {

    /**
     * Create and process a charge
     */
    OmiseCharge createCharge(BigDecimal amount, String currency, String description, String token, String customerId, Map<String, String> metadata);

    /**
     * Create a charge with PromptPay
     */
    OmiseCharge createPromptPayCharge(BigDecimal amount, String currency, String description, Map<String, String> metadata);

    /**
     * Create a charge with TrueMoney
     */
    OmiseCharge createTrueMoneyCharge(BigDecimal amount, String currency, String description, String phoneNumber, Map<String, String> metadata);

    /**
     * Create a charge with Internet Banking
     */
    OmiseCharge createInternetBankingCharge(BigDecimal amount, String currency, String description, String bankCode, Map<String, String> metadata);

    /**
     * Create a charge with Internet Banking with return URL
     */
    OmiseCharge createInternetBankingCharge(BigDecimal amount, String currency, String description, String bankCode, String returnUri, Map<String, String> metadata);

    /**
     * Retrieve a charge by ID
     */
    OmiseCharge getCharge(String chargeId);

    /**
     * Capture a charge (for authorized charges)
     */
    OmiseCharge captureCharge(String chargeId, BigDecimal captureAmount);

    /**
     * Refund a charge
     */
    void refundCharge(String chargeId, BigDecimal refundAmount, String reason);

    /**
     * Get supported payment methods
     */
    String[] getSupportedPaymentMethods();

    /**
     * Verify webhook signature
     */
    boolean verifyWebhookSignature(String payload, String signature);

    /**
     * Convert amount to Omise format (satang/cents)
     */
    long convertToOmiseAmount(BigDecimal amount);

    /**
     * Convert amount from Omise format back to BigDecimal
     */
    BigDecimal convertFromOmiseAmount(long omiseAmount);
}