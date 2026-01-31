package com.ecommerce.EcommerceApplication.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import com.ecommerce.EcommerceApplication.config.OmiseConfig;
import com.ecommerce.EcommerceApplication.model.omise.OmiseCharge;
import com.ecommerce.EcommerceApplication.service.OmisePaymentGatewayService;

@Service
@Primary
public class OmisePaymentGatewayServiceSimulated implements OmisePaymentGatewayService {

    private static final Logger logger = LoggerFactory.getLogger(OmisePaymentGatewayServiceSimulated.class);

    private final OmiseConfig omiseConfig;

    public OmisePaymentGatewayServiceSimulated(OmiseConfig omiseConfig) {
        this.omiseConfig = omiseConfig;
    }

    @Override
    public OmiseCharge createCharge(BigDecimal amount, String currency, String description, String token, String customerId, Map<String, String> metadata) {
        logger.info("Creating simulated Omise charge for amount: {} {}", amount, currency);

        OmiseCharge charge = new OmiseCharge();
        charge.setId("chrg_test_" + UUID.randomUUID().toString().substring(0, 8));
        charge.setObject("charge");
        charge.setLivemode(false);
        charge.setAmount(convertToOmiseAmount(amount));
        charge.setCurrency(currency.toLowerCase());
        charge.setDescription(description);
        charge.setCreatedAt(LocalDateTime.now());

        // Simulate card payment - high success rate
        if (isTestCardToken(token)) {
            charge.setStatus("successful");
            charge.setPaid(true);
            charge.setPaidAt(LocalDateTime.now());
            charge.setTransaction("trxn_test_" + UUID.randomUUID().toString().substring(0, 8));
        } else {
            // Random failure for demo
            boolean success = Math.random() > 0.1; // 90% success rate
            if (success) {
                charge.setStatus("successful");
                charge.setPaid(true);
                charge.setPaidAt(LocalDateTime.now());
                charge.setTransaction("trxn_test_" + UUID.randomUUID().toString().substring(0, 8));
            } else {
                charge.setStatus("failed");
                charge.setPaid(false);
            }
        }

        if (metadata != null) {
            Map<String, Object> metadataObj = new HashMap<>();
            metadata.forEach(metadataObj::put);
            charge.setMetadata(metadataObj);
        }

        return charge;
    }

    @Override
    public OmiseCharge createPromptPayCharge(BigDecimal amount, String currency, String description, Map<String, String> metadata) {
        logger.info("Creating simulated PromptPay charge for amount: {} {}", amount, currency);

        OmiseCharge charge = new OmiseCharge();
        charge.setId("chrg_test_" + UUID.randomUUID().toString().substring(0, 8));
        charge.setObject("charge");
        charge.setLivemode(false);
        charge.setAmount(convertToOmiseAmount(amount));
        charge.setCurrency(currency.toLowerCase());
        charge.setDescription(description);
        charge.setCreatedAt(LocalDateTime.now());
        charge.setStatus("pending"); // PromptPay starts as pending
        charge.setPaid(false);

        // Create mock source with QR code
        OmiseCharge.OmiseSource source = new OmiseCharge.OmiseSource();
        source.setType("promptpay");
        source.setFlow("redirect");
        source.setAmount(convertToOmiseAmount(amount));
        source.setCurrency(currency.toLowerCase());

        // Mock QR code data (in real Omise, this would be actual QR code)
        OmiseCharge.OmiseScannableCode qrCode = new OmiseCharge.OmiseScannableCode();
        qrCode.setType("qr_code");
        qrCode.setValue("00020101021229370016A000000677010111011300660000000000000000005303764540" + String.format("%.2f", amount).replace(".", "") + "6304");
        qrCode.setImage("/9j/4AAQSkZJRgABAQEAAAAAAAD"); // Mock base64 QR code
        source.setScannableCode(qrCode);

        charge.setSource(source);

        if (metadata != null) {
            Map<String, Object> metadataObj = new HashMap<>();
            metadata.forEach(metadataObj::put);
            charge.setMetadata(metadataObj);
        }

        return charge;
    }

    @Override
    public OmiseCharge createTrueMoneyCharge(BigDecimal amount, String currency, String description, String phoneNumber, Map<String, String> metadata) {
        logger.info("Creating simulated TrueMoney charge for amount: {} {} with phone: {}", amount, currency, phoneNumber);

        OmiseCharge charge = new OmiseCharge();
        charge.setId("chrg_test_" + UUID.randomUUID().toString().substring(0, 8));
        charge.setObject("charge");
        charge.setLivemode(false);
        charge.setAmount(convertToOmiseAmount(amount));
        charge.setCurrency(currency.toLowerCase());
        charge.setDescription(description);
        charge.setCreatedAt(LocalDateTime.now());

        // TrueMoney usually requires redirect
        charge.setStatus("pending");
        charge.setPaid(false);
        charge.setAuthorizeUri("https://pay.truemoney.com/redirect?token=test_" + UUID.randomUUID().toString());

        // Create mock source
        OmiseCharge.OmiseSource source = new OmiseCharge.OmiseSource();
        source.setType("truemoney");
        source.setFlow("redirect");
        source.setAmount(convertToOmiseAmount(amount));
        source.setCurrency(currency.toLowerCase());
        charge.setSource(source);

        if (metadata != null) {
            Map<String, Object> metadataObj = new HashMap<>();
            metadata.forEach(metadataObj::put);
            charge.setMetadata(metadataObj);
        }

        return charge;
    }

    @Override
    public OmiseCharge createInternetBankingCharge(BigDecimal amount, String currency, String description, String bankCode, Map<String, String> metadata) {
        return createInternetBankingCharge(amount, currency, description, bankCode, null, metadata);
    }

    @Override
    public OmiseCharge createInternetBankingCharge(BigDecimal amount, String currency, String description, String bankCode, String returnUri, Map<String, String> metadata) {
        logger.info("Creating simulated Internet Banking charge for amount: {} {} with bank: {}", amount, currency, bankCode);

        OmiseCharge charge = new OmiseCharge();
        charge.setId("chrg_test_" + UUID.randomUUID().toString().substring(0, 8));
        charge.setObject("charge");
        charge.setLivemode(false);
        charge.setAmount(convertToOmiseAmount(amount));
        charge.setCurrency(currency.toLowerCase());
        charge.setDescription(description);
        charge.setCreatedAt(LocalDateTime.now());

        // Internet banking requires redirect
        charge.setStatus("pending");
        charge.setPaid(false);

        // Build authorize URI - redirect to our demo bank page
        String authorizeUri = "http://localhost:3000/demo-bank?ref=" + charge.getId();
        if (returnUri != null && !returnUri.isEmpty()) {
            authorizeUri += "&return_uri=" + java.net.URLEncoder.encode(returnUri, java.nio.charset.StandardCharsets.UTF_8);
            logger.info("✅ Internet Banking charge will redirect back to: {}", returnUri);
        }
        charge.setAuthorizeUri(authorizeUri);

        // Create mock source
        OmiseCharge.OmiseSource source = new OmiseCharge.OmiseSource();
        source.setType("internet_banking_" + bankCode);
        source.setFlow("redirect");
        source.setAmount(convertToOmiseAmount(amount));
        source.setCurrency(currency.toLowerCase());
        charge.setSource(source);

        if (metadata != null) {
            Map<String, Object> metadataObj = new HashMap<>();
            metadata.forEach(metadataObj::put);
            charge.setMetadata(metadataObj);
        }

        return charge;
    }

    @Override
    public OmiseCharge getCharge(String chargeId) {
        logger.info("Retrieving simulated charge: {}", chargeId);

        // Return a mock successful charge
        OmiseCharge charge = new OmiseCharge();
        charge.setId(chargeId);
        charge.setObject("charge");
        charge.setLivemode(false);
        charge.setAmount(100000); // 1000.00 THB
        charge.setCurrency("thb");
        charge.setDescription("Test charge");
        charge.setStatus("successful");
        charge.setPaid(true);
        charge.setCreatedAt(LocalDateTime.now().minusMinutes(5));
        charge.setPaidAt(LocalDateTime.now());
        charge.setTransaction("trxn_test_" + UUID.randomUUID().toString().substring(0, 8));

        return charge;
    }

    @Override
    public OmiseCharge captureCharge(String chargeId, BigDecimal captureAmount) {
        logger.info("Capturing simulated charge: {} with amount: {}", chargeId, captureAmount);

        OmiseCharge charge = getCharge(chargeId);
        charge.setStatus("successful");
        charge.setPaid(true);
        charge.setPaidAt(LocalDateTime.now());

        return charge;
    }

    @Override
    public void refundCharge(String chargeId, BigDecimal refundAmount, String reason) {
        logger.info("Refunding simulated charge: {} with amount: {} for reason: {}", chargeId, refundAmount, reason);
        // In a real implementation, this would create a refund object
    }

    @Override
    public String[] getSupportedPaymentMethods() {
        return new String[]{
                "credit_card",
                "debit_card",
                "promptpay",
                "truemoney",
                "internet_banking_bay",
                "internet_banking_bbl",
                "internet_banking_ktb",
                "internet_banking_scb",
                "internet_banking_kbank"
        };
    }

    @Override
    public boolean verifyWebhookSignature(String payload, String signature) {
        // For demo purposes, always return true
        logger.info("Verifying webhook signature (simulated)");
        return true;
    }

    @Override
    public long convertToOmiseAmount(BigDecimal amount) {
        // Convert to satang (multiply by 100 for THB)
        return amount.multiply(BigDecimal.valueOf(100)).longValue();
    }

    @Override
    public BigDecimal convertFromOmiseAmount(long omiseAmount) {
        // Convert from satang (divide by 100 for THB)
        return BigDecimal.valueOf(omiseAmount).divide(BigDecimal.valueOf(100));
    }

    private boolean isTestCardToken(String token) {
        // Check if this is a test token (from frontend)
        return token != null && token.startsWith("tokn_test_");
    }
}