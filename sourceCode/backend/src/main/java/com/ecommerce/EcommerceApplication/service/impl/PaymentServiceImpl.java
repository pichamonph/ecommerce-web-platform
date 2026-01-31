package com.ecommerce.EcommerceApplication.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.EcommerceApplication.dto.CreatePaymentReq;
import com.ecommerce.EcommerceApplication.dto.PaymentDto;
import com.ecommerce.EcommerceApplication.dto.PaymentWebhookReq;
import com.ecommerce.EcommerceApplication.entity.Order;
import com.ecommerce.EcommerceApplication.entity.OrderStatus;
import com.ecommerce.EcommerceApplication.entity.Payment;
import com.ecommerce.EcommerceApplication.entity.Payment.PaymentMethod;
import com.ecommerce.EcommerceApplication.entity.Payment.PaymentStatus;
import com.ecommerce.EcommerceApplication.repository.OrderRepository;
import com.ecommerce.EcommerceApplication.repository.PaymentRepository;
import com.ecommerce.EcommerceApplication.service.PaymentService;
import com.ecommerce.EcommerceApplication.service.OmisePaymentGatewayService;
import com.ecommerce.EcommerceApplication.model.omise.OmiseCharge;

@Service
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private static final Logger logger = LoggerFactory.getLogger(PaymentServiceImpl.class);

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final OmisePaymentGatewayService omisePaymentGatewayService;

    public PaymentServiceImpl(PaymentRepository paymentRepository, OrderRepository orderRepository, OmisePaymentGatewayService omisePaymentGatewayService) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.omisePaymentGatewayService = omisePaymentGatewayService;
    }

    @Override
    public PaymentDto createPayment(CreatePaymentReq req) {
        // Validate order exists and can be paid
        Order order = orderRepository.findById(req.orderId)
            .orElseThrow(() -> new IllegalArgumentException("Order not found: " + req.orderId));

        // Check if order can be paid (not already fully paid)
        if (isOrderFullyPaid(req.orderId)) {
            throw new IllegalStateException("Order is already fully paid");
        }

        // Create payment
        Payment payment = new Payment(order, req.paymentMethod, req.amount);
        payment.setCurrency(req.currency);
        payment.setPaymentDetails(req.paymentDetails);

        payment = paymentRepository.save(payment);
        return mapToDto(payment);
    }

    @Override
    public PaymentDto processPayment(Long paymentId, String gatewayData) {
        Payment payment = paymentRepository.findById(paymentId)
            .orElseThrow(() -> new IllegalArgumentException("Payment not found: " + paymentId));

        if (!PaymentStatus.PENDING.equals(payment.getStatus())) {
            throw new IllegalStateException("Payment is not in pending status");
        }

        // Here you would integrate with actual payment gateway
        // For now, simulate payment processing
        boolean paymentSuccess = simulatePaymentGateway(payment, gatewayData);

        if (paymentSuccess) {
            payment.markAsCompleted("TXN" + System.currentTimeMillis());
            // Update order status if fully paid
            updateOrderStatusIfNeeded(payment.getOrderId());
        } else {
            payment.markAsFailed("Gateway processing failed");
        }

        payment = paymentRepository.save(payment);
        return mapToDto(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentDto getPaymentById(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
            .orElseThrow(() -> new IllegalArgumentException("Payment not found: " + paymentId));
        return mapToDto(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentDto getPaymentByNumber(String paymentNumber) {
        Payment payment = paymentRepository.findByPaymentNumber(paymentNumber)
            .orElseThrow(() -> new IllegalArgumentException("Payment not found: " + paymentNumber));
        return mapToDto(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentDto getPaymentByGatewayTransactionId(String gatewayTransactionId) {
        Payment payment = paymentRepository.findByGatewayTransactionId(gatewayTransactionId)
            .orElseThrow(() -> new IllegalArgumentException("Payment not found for transaction: " + gatewayTransactionId));
        return mapToDto(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentDto> getPaymentsByOrderId(Long orderId) {
        return paymentRepository.findByOrderIdOrderByCreatedAtDesc(orderId)
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PaymentDto> getPaymentsByUserId(Long userId, Pageable pageable) {
        return paymentRepository.findByUserId(userId, pageable)
            .map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PaymentDto> getPaymentsByStatus(PaymentStatus status, Pageable pageable) {
        return paymentRepository.findByStatus(status, pageable)
            .map(this::mapToDto);
    }

    @Override
    public PaymentDto updatePaymentStatus(Long paymentId, PaymentStatus newStatus, String reason) {
        Payment payment = paymentRepository.findById(paymentId)
            .orElseThrow(() -> new IllegalArgumentException("Payment not found: " + paymentId));

        PaymentStatus oldStatus = payment.getStatus();
        payment.setStatus(newStatus);

        switch (newStatus) {
            case COMPLETED:
                if (payment.getPaidAt() == null) {
                    payment.setPaidAt(LocalDateTime.now());
                }
                updateOrderStatusIfNeeded(payment.getOrderId());
                break;
            case FAILED:
            case CANCELLED:
                payment.setFailureReason(reason);
                if (payment.getFailedAt() == null) {
                    payment.setFailedAt(LocalDateTime.now());
                }
                break;
            case REFUNDED:
                if (payment.getRefundedAt() == null) {
                    payment.setRefundedAt(LocalDateTime.now());
                }
                break;
        }

        payment = paymentRepository.save(payment);
        return mapToDto(payment);
    }

    @Override
    public void handlePaymentWebhook(PaymentWebhookReq webhookData) {
        // Find payment by payment number or gateway transaction ID
        Payment payment = paymentRepository.findByPaymentNumber(webhookData.paymentNumber)
            .orElseThrow(() -> new IllegalArgumentException("Payment not found: " + webhookData.paymentNumber));

        // Update payment based on webhook status
        switch (webhookData.status.toLowerCase()) {
            case "success":
            case "completed":
                if (PaymentStatus.PENDING.equals(payment.getStatus())) {
                    payment.markAsCompleted(webhookData.gatewayTransactionId);
                    payment.setGatewayFee(webhookData.gatewayFee);
                    updateOrderStatusIfNeeded(payment.getOrderId());
                }
                break;
            case "failed":
            case "error":
                payment.markAsFailed(webhookData.failureReason);
                break;
        }

        // Store webhook response
        payment.setGatewayResponse(webhookData.rawData);
        paymentRepository.save(payment);
    }

    @Override
    public PaymentDto completePayment(Long paymentId, String transactionId) {
        Payment payment = paymentRepository.findById(paymentId)
            .orElseThrow(() -> new IllegalArgumentException("Payment not found: " + paymentId));

        payment.markAsCompleted(transactionId);
        updateOrderStatusIfNeeded(payment.getOrderId());

        payment = paymentRepository.save(payment);
        return mapToDto(payment);
    }

    @Override
    public PaymentDto failPayment(Long paymentId, String reason) {
        Payment payment = paymentRepository.findById(paymentId)
            .orElseThrow(() -> new IllegalArgumentException("Payment not found: " + paymentId));

        payment.markAsFailed(reason);
        payment = paymentRepository.save(payment);
        return mapToDto(payment);
    }

    @Override
    public PaymentDto refundPayment(Long paymentId, BigDecimal refundAmount, String reason) {
        Payment payment = paymentRepository.findById(paymentId)
            .orElseThrow(() -> new IllegalArgumentException("Payment not found: " + paymentId));

        if (!payment.canBeRefunded()) {
            throw new IllegalStateException("Payment cannot be refunded");
        }

        // Create refund payment record (negative amount)
        Order order = payment.getOrder();
        Payment refundPayment = new Payment(order, payment.getPaymentMethod(), refundAmount.negate());
        refundPayment.setStatus(PaymentStatus.REFUNDED);
        refundPayment.setFailureReason(reason);
        refundPayment.setRefundedAt(LocalDateTime.now());

        refundPayment = paymentRepository.save(refundPayment);

        // Update original payment status if full refund
        if (refundAmount.compareTo(payment.getAmount()) >= 0) {
            payment.markAsRefunded();
            paymentRepository.save(payment);
        }

        return mapToDto(refundPayment);
    }

    @Override
    public PaymentDto cancelPayment(Long paymentId, String reason) {
        Payment payment = paymentRepository.findById(paymentId)
            .orElseThrow(() -> new IllegalArgumentException("Payment not found: " + paymentId));

        if (!PaymentStatus.PENDING.equals(payment.getStatus())) {
            throw new IllegalStateException("Only pending payments can be cancelled");
        }

        payment.setStatus(PaymentStatus.CANCELLED);
        payment.setFailureReason(reason);
        payment.setFailedAt(LocalDateTime.now());

        payment = paymentRepository.save(payment);
        return mapToDto(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isOrderFullyPaid(Long orderId) {
        return paymentRepository.hasCompletedPayment(orderId);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getTotalPaidAmount(Long orderId) {
        Double total = paymentRepository.getTotalPaidAmountByOrderId(orderId);
        return BigDecimal.valueOf(total != null ? total : 0.0);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentMethod> getSupportedPaymentMethods() {
        return Arrays.asList(PaymentMethod.values());
    }

    @Override
    public void cleanupExpiredPayments() {
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(24); // 24 hours timeout
        List<Payment> expiredPayments = paymentRepository.findPendingPaymentsOlderThan(cutoffTime);

        for (Payment payment : expiredPayments) {
            payment.setStatus(PaymentStatus.CANCELLED);
            payment.setFailureReason("Payment expired");
            payment.setFailedAt(LocalDateTime.now());
        }

        paymentRepository.saveAll(expiredPayments);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentStats getPaymentStatistics() {
        List<Object[]> statusCounts = paymentRepository.countPaymentsByStatus();

        PaymentStats stats = new PaymentStats();
        stats.totalPayments = 0L;
        stats.pendingPayments = 0L;
        stats.completedPayments = 0L;
        stats.failedPayments = 0L;

        for (Object[] row : statusCounts) {
            PaymentStatus status = (PaymentStatus) row[0];
            Long count = (Long) row[1];

            stats.totalPayments += count;
            switch (status) {
                case PENDING -> stats.pendingPayments = count;
                case COMPLETED -> stats.completedPayments = count;
                case FAILED, CANCELLED -> stats.failedPayments += count;
            }
        }

        return stats;
    }

    // ===== Private Helper Methods =====

    private void updateOrderStatusIfNeeded(Long orderId) {
        if (isOrderFullyPaid(orderId)) {
            Order order = orderRepository.findById(orderId).orElse(null);
            if (order != null && order.getStatus() == OrderStatus.PENDING) {
                // Use changeStatusAutomatically to properly track status changes with history
                boolean updated = order.changeStatusAutomatically(
                    OrderStatus.PAID,
                    "Payment completed successfully - Order is now paid and waiting for seller confirmation"
                );

                if (updated) {
                    orderRepository.save(order);
                    logger.info("✅ Order #{} status automatically updated from PENDING to PAID after payment completion",
                               order.getOrderNumber());
                } else {
                    logger.warn("⚠️ Failed to update Order #{} status to PAID - invalid transition from {}",
                               order.getOrderNumber(), order.getStatus());
                }
            } else if (order != null) {
                logger.debug("Order #{} is already in status: {}, skipping auto-update",
                           order.getOrderNumber(), order.getStatus());
            }
        }
    }

    private boolean simulatePaymentGateway(Payment payment, String gatewayData) {
        // Handle Omise payment methods
        if (isOmisePaymentMethod(payment.getPaymentMethod())) {
            return processOmisePayment(payment, gatewayData);
        }

        // Legacy payment gateway simulation
        switch (payment.getPaymentMethod()) {
            case CASH_ON_DELIVERY:
                return true; // COD is always successful at creation
            case CREDIT_CARD:
            case DEBIT_CARD:
                return Math.random() > 0.1; // 90% success rate
            case BANK_TRANSFER:
            case PROMPTPAY:
                return Math.random() > 0.05; // 95% success rate
            default:
                return Math.random() > 0.2; // 80% success rate
        }
    }

    private boolean isOmisePaymentMethod(PaymentMethod method) {
        return method.name().startsWith("OMISE_");
    }

    private boolean processOmisePayment(Payment payment, String gatewayData) {
        try {
            // Parse gateway data (should contain token, phone number, or bank code)
            Map<String, String> metadata = new HashMap<>();
            metadata.put("payment_id", payment.getId().toString());
            metadata.put("order_id", payment.getOrderId().toString());

            OmiseCharge charge = null;
            String description = "Payment for Order #" + payment.getOrder().getOrderNumber();

            switch (payment.getPaymentMethod()) {
                case OMISE_CREDIT_CARD:
                case OMISE_DEBIT_CARD:
                    charge = omisePaymentGatewayService.createCharge(
                        payment.getAmount(),
                        payment.getCurrency(),
                        description,
                        gatewayData, // token from frontend
                        null, // customer ID
                        metadata
                    );
                    break;

                case OMISE_PROMPTPAY:
                    charge = omisePaymentGatewayService.createPromptPayCharge(
                        payment.getAmount(),
                        payment.getCurrency(),
                        description,
                        metadata
                    );
                    break;

                case OMISE_TRUEMONEY:
                    // gatewayData should contain phone number
                    charge = omisePaymentGatewayService.createTrueMoneyCharge(
                        payment.getAmount(),
                        payment.getCurrency(),
                        description,
                        gatewayData, // phone number
                        metadata
                    );
                    break;

                case OMISE_INTERNET_BANKING_BAY:
                    charge = omisePaymentGatewayService.createInternetBankingCharge(
                        payment.getAmount(),
                        payment.getCurrency(),
                        description,
                        "bay",
                        metadata
                    );
                    break;

                case OMISE_INTERNET_BANKING_BBL:
                    charge = omisePaymentGatewayService.createInternetBankingCharge(
                        payment.getAmount(),
                        payment.getCurrency(),
                        description,
                        "bbl",
                        metadata
                    );
                    break;

                case OMISE_INTERNET_BANKING_KTB:
                    charge = omisePaymentGatewayService.createInternetBankingCharge(
                        payment.getAmount(),
                        payment.getCurrency(),
                        description,
                        "ktb",
                        metadata
                    );
                    break;

                case OMISE_INTERNET_BANKING_SCB:
                    charge = omisePaymentGatewayService.createInternetBankingCharge(
                        payment.getAmount(),
                        payment.getCurrency(),
                        description,
                        "scb",
                        metadata
                    );
                    break;

                case OMISE_INTERNET_BANKING_KBANK:
                    charge = omisePaymentGatewayService.createInternetBankingCharge(
                        payment.getAmount(),
                        payment.getCurrency(),
                        description,
                        "kbank",
                        metadata
                    );
                    break;

                default:
                    logger.warn("Unsupported Omise payment method: {}", payment.getPaymentMethod());
                    return false;
            }

            if (charge != null) {
                // Store Omise charge information
                payment.setGatewayTransactionId(charge.getId());

                // Convert Omise response to JSON and store
                Map<String, Object> responseData = new HashMap<>();
                responseData.put("omise_charge_id", charge.getId());
                responseData.put("omise_status", charge.getStatus());
                responseData.put("omise_paid", charge.getPaid());
                responseData.put("omise_created", charge.getCreated());

                if (charge.getSource() != null) {
                    responseData.put("omise_source_type", charge.getSource().getType());
                }

                payment.setGatewayResponse(responseData.toString());

                // Handle different charge statuses
                switch (charge.getStatus()) {
                    case "successful":
                        return true;
                    case "pending":
                        // For methods like PromptPay, payment is pending until customer pays
                        payment.setStatus(PaymentStatus.PROCESSING);
                        return false; // Don't mark as completed yet
                    case "failed":
                        return false;
                    default:
                        logger.info("Omise charge created with status: {}", charge.getStatus());
                        return "successful".equals(charge.getStatus());
                }
            }

            return false;

        } catch (Exception e) {
            logger.error("Failed to process Omise payment", e);
            payment.setFailureReason("Omise payment processing failed: " + e.getMessage());
            return false;
        }
    }

    private PaymentDto mapToDto(Payment payment) {
        PaymentDto dto = new PaymentDto();
        dto.id = payment.getId();
        dto.paymentNumber = payment.getPaymentNumber();
        dto.orderId = payment.getOrderId();

        if (payment.getOrder() != null) {
            dto.orderNumber = payment.getOrder().getOrderNumber();
        }

        dto.paymentMethod = payment.getPaymentMethod();
        dto.paymentMethodDisplayName = payment.getPaymentMethod().getDisplayName();

        dto.status = payment.getStatus();
        dto.statusDisplayName = payment.getStatus().getDisplayName();

        dto.amount = payment.getAmount();
        dto.currency = payment.getCurrency();

        dto.gatewayTransactionId = payment.getGatewayTransactionId();
        dto.gatewayFee = payment.getGatewayFee();
        dto.failureReason = payment.getFailureReason();

        dto.createdAt = payment.getCreatedAt();
        dto.paidAt = payment.getPaidAt();
        dto.failedAt = payment.getFailedAt();
        dto.refundedAt = payment.getRefundedAt();

        // Computed fields
        dto.formattedAmount = String.format("฿%,.2f", payment.getAmount());
        dto.canRefund = payment.canBeRefunded();
        dto.isCompleted = payment.isCompleted();

        return dto;
    }
}