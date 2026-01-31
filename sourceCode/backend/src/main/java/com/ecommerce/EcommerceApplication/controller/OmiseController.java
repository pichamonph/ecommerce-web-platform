package com.ecommerce.EcommerceApplication.controller;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.ecommerce.EcommerceApplication.config.AppConfig;
import com.ecommerce.EcommerceApplication.config.OmiseConfig;
import com.ecommerce.EcommerceApplication.dto.OmiseCreateChargeReq;
import com.ecommerce.EcommerceApplication.dto.OmiseWebhookEvent;
import com.ecommerce.EcommerceApplication.dto.CreatePaymentReq;
import com.ecommerce.EcommerceApplication.dto.PaymentDto;
import com.ecommerce.EcommerceApplication.service.OmisePaymentGatewayService;
import com.ecommerce.EcommerceApplication.service.PaymentService;
import com.ecommerce.EcommerceApplication.entity.Payment.PaymentMethod;

import com.ecommerce.EcommerceApplication.model.omise.OmiseCharge;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/payments/omise")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class OmiseController {

    private static final Logger logger = LoggerFactory.getLogger(OmiseController.class);

    private final OmisePaymentGatewayService omisePaymentGatewayService;
    private final PaymentService paymentService;
    private final OmiseConfig omiseConfig;
    private final AppConfig appConfig;

    public OmiseController(OmisePaymentGatewayService omisePaymentGatewayService,
                          PaymentService paymentService,
                          OmiseConfig omiseConfig,
                          AppConfig appConfig) {
        this.omisePaymentGatewayService = omisePaymentGatewayService;
        this.paymentService = paymentService;
        this.omiseConfig = omiseConfig;
        this.appConfig = appConfig;
    }

    /**
     * Get Omise public key for frontend
     */
    @GetMapping("/public-key")
    public ResponseEntity<Map<String, String>> getPublicKey() {
        Map<String, String> response = new HashMap<>();
        response.put("publicKey", omiseConfig.getPublicKey());
        return ResponseEntity.ok(response);
    }

    /**
     * Get supported payment methods
     */
    @GetMapping("/payment-methods")
    public ResponseEntity<String[]> getSupportedPaymentMethods() {
        String[] methods = omisePaymentGatewayService.getSupportedPaymentMethods();
        return ResponseEntity.ok(methods);
    }

    /**
     * Create Omise charge directly (advanced usage)
     */
    @PostMapping("/charges")
    public ResponseEntity<?> createCharge(@Valid @RequestBody OmiseCreateChargeReq req) {
        try {
            Map<String, String> metadata = req.metadata != null ? req.metadata : new HashMap<>();
            metadata.put("order_id", req.orderId.toString());

            OmiseCharge charge = null;
            String description = req.description != null ? req.description : "Payment for Order #" + req.orderId;

            switch (req.paymentMethod) {
                case OMISE_CREDIT_CARD:
                case OMISE_DEBIT_CARD:
                    if (req.token == null) {
                        return ResponseEntity.badRequest().body("Token is required for card payments");
                    }
                    charge = omisePaymentGatewayService.createCharge(
                        req.amount, req.currency, description, req.token, null, metadata
                    );
                    break;

                case OMISE_PROMPTPAY:
                    charge = omisePaymentGatewayService.createPromptPayCharge(
                        req.amount, req.currency, description, metadata
                    );
                    break;

                case OMISE_TRUEMONEY:
                    if (req.phoneNumber == null) {
                        return ResponseEntity.badRequest().body("Phone number is required for TrueMoney payments");
                    }
                    charge = omisePaymentGatewayService.createTrueMoneyCharge(
                        req.amount, req.currency, description, req.phoneNumber, metadata
                    );
                    break;

                case OMISE_INTERNET_BANKING_BAY:
                case OMISE_INTERNET_BANKING_BBL:
                case OMISE_INTERNET_BANKING_KTB:
                case OMISE_INTERNET_BANKING_SCB:
                case OMISE_INTERNET_BANKING_KBANK:
                    if (req.bankCode == null) {
                        // Extract bank code from payment method
                        String methodName = req.paymentMethod.name();
                        req.bankCode = methodName.substring(methodName.lastIndexOf("_") + 1).toLowerCase();
                    }
                    // Set return URI to redirect back after payment
                    String returnUri = appConfig.getFrontendUrl() + "/payment/callback?order_id=" + req.orderId;
                    charge = omisePaymentGatewayService.createInternetBankingCharge(
                        req.amount, req.currency, description, req.bankCode, returnUri, metadata
                    );
                    break;

                default:
                    return ResponseEntity.badRequest().body("Unsupported payment method: " + req.paymentMethod);
            }

            if (charge != null) {
                // Create Payment record in database
                try {
                    CreatePaymentReq paymentReq = new CreatePaymentReq();
                    paymentReq.orderId = req.orderId;
                    paymentReq.paymentMethod = req.paymentMethod;
                    paymentReq.amount = omisePaymentGatewayService.convertFromOmiseAmount(charge.getAmount());
                    paymentReq.currency = charge.getCurrency();

                    PaymentDto payment = paymentService.createPayment(paymentReq);

                    // Save Omise charge ID to payment record (for webhook lookup)
                    paymentService.completePayment(payment.id, charge.getId());
                    logger.info("✅ Created payment {} for order {} with Omise charge ID: {}",
                               payment.id, req.orderId, charge.getId());

                    // If charge is already paid (e.g., credit card), mark payment as completed
                    if (charge.getPaid() != null && charge.getPaid()) {
                        logger.info("💰 Charge {} is already paid, updating payment status", charge.getId());
                        paymentService.updatePaymentStatus(payment.id,
                            com.ecommerce.EcommerceApplication.entity.Payment.PaymentStatus.COMPLETED,
                            "Paid immediately via " + req.paymentMethod);
                    }

                } catch (Exception e) {
                    logger.error("❌ Failed to create payment record for Omise charge: {}", charge.getId(), e);
                    // Continue even if payment record creation fails
                }

                Map<String, Object> response = new HashMap<>();
                response.put("id", charge.getId());
                response.put("status", charge.getStatus());
                response.put("amount", charge.getAmount());
                response.put("currency", charge.getCurrency());
                response.put("paid", charge.getPaid());
                response.put("created", charge.getCreated());

                // Add payment-specific information
                if (charge.getSource() != null) {
                    Map<String, Object> source = new HashMap<>();
                    source.put("type", charge.getSource().getType());

                    // For PromptPay, include QR code data
                    if ("promptpay".equals(charge.getSource().getType()) && charge.getSource().getScannableCode() != null) {
                        Map<String, Object> scannableCode = new HashMap<>();
                        scannableCode.put("type", charge.getSource().getScannableCode().getType());
                        scannableCode.put("image", charge.getSource().getScannableCode().getImage());
                        scannableCode.put("value", charge.getSource().getScannableCode().getValue());
                        source.put("scannable_code", scannableCode);
                    }

                    response.put("source", source);
                }

                // For 3D Secure redirects
                if (charge.getAuthorizeUri() != null) {
                    response.put("authorize_uri", charge.getAuthorizeUri());
                    response.put("requires_action", true);
                }

                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.internalServerError().body("Failed to create Omise charge");
            }

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Failed to create Omise charge", e);
            return ResponseEntity.internalServerError().body("Payment processing failed");
        }
    }

    /**
     * Get charge status and sync payment record
     */
    @GetMapping("/charges/{chargeId}")
    public ResponseEntity<?> getCharge(@PathVariable String chargeId) {
        try {
            OmiseCharge charge = omisePaymentGatewayService.getCharge(chargeId);

            // Try to sync payment status with our database
            try {
                PaymentDto payment = paymentService.getPaymentByGatewayTransactionId(chargeId);

                // If Omise says paid but our DB says pending, update it
                if (charge.getPaid() != null && charge.getPaid() &&
                    "PENDING".equals(payment.statusDisplayName)) {

                    logger.info("🔄 Syncing payment {} status: Omise is paid, updating our DB", payment.id);
                    paymentService.updatePaymentStatus(payment.id,
                        com.ecommerce.EcommerceApplication.entity.Payment.PaymentStatus.COMPLETED,
                        "Payment confirmed via Omise charge check");
                }
            } catch (IllegalArgumentException e) {
                logger.debug("No payment record found for charge {}, skipping sync", chargeId);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("id", charge.getId());
            response.put("status", charge.getStatus());
            response.put("amount", charge.getAmount());
            response.put("currency", charge.getCurrency());
            response.put("paid", charge.getPaid());
            response.put("created", charge.getCreated());

            if (charge.getSource() != null) {
                Map<String, Object> source = new HashMap<>();
                source.put("type", charge.getSource().getType());
                response.put("source", source);
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Failed to retrieve Omise charge: {}", chargeId, e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Webhook endpoint for Omise events
     */
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "X-Omise-Signature", required = false) String signature) {

        try {
            // Verify webhook signature
            if (signature == null || !omisePaymentGatewayService.verifyWebhookSignature(payload, signature)) {
                logger.warn("Invalid webhook signature received");
                return ResponseEntity.badRequest().body("Invalid signature");
            }

            // Parse webhook event
            logger.info("Received Omise webhook: {}", payload);

            // Parse the webhook payload to extract event information
            try {
                ObjectMapper mapper = new ObjectMapper();
                JsonNode webhookEvent = mapper.readTree(payload);

                String eventType = webhookEvent.get("key").asText();
                JsonNode chargeData = webhookEvent.get("data");

                if (chargeData != null) {
                    String chargeId = chargeData.get("id").asText();
                    String chargeStatus = chargeData.get("status").asText();

                    logger.info("Processing webhook event: {} for charge: {} with status: {}",
                              eventType, chargeId, chargeStatus);

                    // Update payment status based on webhook event
                    switch (eventType) {
                        case "charge.complete":
                            if ("successful".equals(chargeStatus) || "paid".equals(chargeStatus)) {
                                updatePaymentStatusFromOmise(chargeId, "COMPLETED", "Payment completed via Omise webhook");
                            }
                            break;

                        case "charge.failed":
                            updatePaymentStatusFromOmise(chargeId, "FAILED", "Payment failed via Omise webhook");
                            break;

                        case "charge.expired":
                            updatePaymentStatusFromOmise(chargeId, "EXPIRED", "Payment expired via Omise webhook");
                            break;

                        case "charge.pending":
                            updatePaymentStatusFromOmise(chargeId, "PROCESSING", "Payment pending via Omise webhook");
                            break;

                        default:
                            logger.info("Unhandled webhook event type: {}", eventType);
                    }
                }

            } catch (Exception e) {
                logger.error("Failed to parse webhook payload", e);
                return ResponseEntity.badRequest().body("Invalid webhook payload");
            }

            return ResponseEntity.ok("Webhook processed successfully");

        } catch (Exception e) {
            logger.error("Failed to process Omise webhook", e);
            return ResponseEntity.internalServerError().body("Webhook processing failed");
        }
    }

    /**
     * Refund a charge (ADMIN only)
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/charges/{chargeId}/refund")
    public ResponseEntity<?> refundCharge(
            @PathVariable String chargeId,
            @RequestParam(required = false) String amount,
            @RequestParam(required = false) String reason) {

        try {
            // If amount not specified, it will be a full refund
            if (amount != null) {
                omisePaymentGatewayService.refundCharge(chargeId,
                    new java.math.BigDecimal(amount), reason);
            } else {
                // Full refund - get charge first to get amount
                OmiseCharge charge = omisePaymentGatewayService.getCharge(chargeId);
                java.math.BigDecimal refundAmount = omisePaymentGatewayService.convertFromOmiseAmount(charge.getAmount());
                omisePaymentGatewayService.refundCharge(chargeId, refundAmount, reason);
            }

            return ResponseEntity.ok("Refund processed successfully");

        } catch (Exception e) {
            logger.error("Failed to refund Omise charge: {}", chargeId, e);
            return ResponseEntity.internalServerError().body("Refund processing failed");
        }
    }

    /**
     * Helper method to update payment status from Omise webhook
     */
    private void updatePaymentStatusFromOmise(String omiseChargeId, String status, String reason) {
        try {
            logger.info("🔍 Attempting to update payment status for Omise charge: {} to status: {}",
                       omiseChargeId, status);

            // Find payment by gateway transaction ID (Omise charge ID)
            try {
                PaymentDto payment = paymentService.getPaymentByGatewayTransactionId(omiseChargeId);

                logger.info("✅ Found payment {} for Omise charge {}, updating status to {}",
                           payment.id, omiseChargeId, status);

                // Map webhook status to our PaymentStatus enum
                com.ecommerce.EcommerceApplication.entity.Payment.PaymentStatus paymentStatus;
                switch (status.toUpperCase()) {
                    case "COMPLETED":
                        paymentStatus = com.ecommerce.EcommerceApplication.entity.Payment.PaymentStatus.COMPLETED;
                        break;
                    case "FAILED":
                        paymentStatus = com.ecommerce.EcommerceApplication.entity.Payment.PaymentStatus.FAILED;
                        break;
                    case "EXPIRED":
                        paymentStatus = com.ecommerce.EcommerceApplication.entity.Payment.PaymentStatus.CANCELLED;
                        break;
                    case "PROCESSING":
                        paymentStatus = com.ecommerce.EcommerceApplication.entity.Payment.PaymentStatus.PROCESSING;
                        break;
                    default:
                        logger.warn("⚠️ Unknown payment status: {}, skipping update", status);
                        return;
                }

                paymentService.updatePaymentStatus(payment.id, paymentStatus, reason);
                logger.info("💰 Payment {} status updated successfully via webhook", payment.id);

            } catch (IllegalArgumentException e) {
                logger.warn("⚠️ No payment found for Omise charge: {} (may be created without payment record)", omiseChargeId);
            }

        } catch (Exception e) {
            logger.error("❌ Failed to update payment status for Omise charge: {}", omiseChargeId, e);
        }
    }
}