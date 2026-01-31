package com.ecommerce.EcommerceApplication.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.ecommerce.EcommerceApplication.dto.CreatePaymentReq;
import com.ecommerce.EcommerceApplication.dto.PaymentDto;
import com.ecommerce.EcommerceApplication.dto.PaymentWebhookReq;
import com.ecommerce.EcommerceApplication.entity.Payment.PaymentMethod;
import com.ecommerce.EcommerceApplication.entity.Payment.PaymentStatus;
import com.ecommerce.EcommerceApplication.service.PaymentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/payments")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * Create a new payment
     */
    @PostMapping
    public ResponseEntity<?> createPayment(@Valid @RequestBody CreatePaymentReq req) {
        try {
            PaymentDto payment = paymentService.createPayment(req);
            return ResponseEntity.ok(payment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Process payment through gateway
     */
    @PostMapping("/{paymentId}/process")
    public ResponseEntity<?> processPayment(@PathVariable Long paymentId,
                                          @RequestBody String gatewayData) {
        try {
            PaymentDto payment = paymentService.processPayment(paymentId, gatewayData);
            return ResponseEntity.ok(payment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Get payment by ID
     */
    @GetMapping("/{paymentId}")
    public ResponseEntity<?> getPayment(@PathVariable Long paymentId) {
        try {
            PaymentDto payment = paymentService.getPaymentById(paymentId);
            return ResponseEntity.ok(payment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get payment by payment number
     */
    @GetMapping("/number/{paymentNumber}")
    public ResponseEntity<?> getPaymentByNumber(@PathVariable String paymentNumber) {
        try {
            PaymentDto payment = paymentService.getPaymentByNumber(paymentNumber);
            return ResponseEntity.ok(payment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get payments for an order
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<PaymentDto>> getPaymentsByOrder(@PathVariable Long orderId) {
        List<PaymentDto> payments = paymentService.getPaymentsByOrderId(orderId);
        return ResponseEntity.ok(payments);
    }

    /**
     * Get payments for current user (ใช้ userId จาก JWT)
     */
    @GetMapping("/my-payments")
    public ResponseEntity<Page<PaymentDto>> getMyPayments(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Long userId = Long.parseLong(auth.getName());
        Page<PaymentDto> payments = paymentService.getPaymentsByUserId(userId, PageRequest.of(page, size));
        return ResponseEntity.ok(payments);
    }

    /**
     * Get payments for a user (ADMIN only)
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<PaymentDto>> getPaymentsByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<PaymentDto> payments = paymentService.getPaymentsByUserId(userId, PageRequest.of(page, size));
        return ResponseEntity.ok(payments);
    }

    /**
     * Get payments by status (ADMIN only)
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/status/{status}")
    public ResponseEntity<Page<PaymentDto>> getPaymentsByStatus(
            @PathVariable PaymentStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<PaymentDto> payments = paymentService.getPaymentsByStatus(status, PageRequest.of(page, size));
        return ResponseEntity.ok(payments);
    }

    /**
     * Update payment status (ADMIN only)
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{paymentId}/status")
    public ResponseEntity<?> updatePaymentStatus(
            @PathVariable Long paymentId,
            @RequestParam PaymentStatus status,
            @RequestParam(required = false) String reason) {
        try {
            PaymentDto payment = paymentService.updatePaymentStatus(paymentId, status, reason);
            return ResponseEntity.ok(payment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Complete payment manually (ADMIN only)
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{paymentId}/complete")
    public ResponseEntity<?> completePayment(
            @PathVariable Long paymentId,
            @RequestParam String transactionId) {
        try {
            PaymentDto payment = paymentService.completePayment(paymentId, transactionId);
            return ResponseEntity.ok(payment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Fail payment manually (ADMIN only)
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{paymentId}/fail")
    public ResponseEntity<?> failPayment(
            @PathVariable Long paymentId,
            @RequestParam String reason) {
        try {
            PaymentDto payment = paymentService.failPayment(paymentId, reason);
            return ResponseEntity.ok(payment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Refund payment (ADMIN only)
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{paymentId}/refund")
    public ResponseEntity<?> refundPayment(
            @PathVariable Long paymentId,
            @RequestParam BigDecimal refundAmount,
            @RequestParam String reason) {
        try {
            PaymentDto payment = paymentService.refundPayment(paymentId, refundAmount, reason);
            return ResponseEntity.ok(payment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Cancel payment (User can cancel their own payment)
     */
    @PostMapping("/{paymentId}/cancel")
    public ResponseEntity<?> cancelPayment(
            @PathVariable Long paymentId,
            @RequestParam String reason) {
        try {
            PaymentDto payment = paymentService.cancelPayment(paymentId, reason);
            return ResponseEntity.ok(payment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Check if order is fully paid
     */
    @GetMapping("/order/{orderId}/paid-status")
    public ResponseEntity<Boolean> isOrderPaid(@PathVariable Long orderId) {
        boolean isPaid = paymentService.isOrderFullyPaid(orderId);
        return ResponseEntity.ok(isPaid);
    }

    /**
     * Get total paid amount for order
     */
    @GetMapping("/order/{orderId}/paid-amount")
    public ResponseEntity<BigDecimal> getTotalPaidAmount(@PathVariable Long orderId) {
        BigDecimal totalPaid = paymentService.getTotalPaidAmount(orderId);
        return ResponseEntity.ok(totalPaid);
    }

    /**
     * Get supported payment methods
     */
    @GetMapping("/methods")
    public ResponseEntity<List<PaymentMethod>> getSupportedPaymentMethods() {
        List<PaymentMethod> methods = paymentService.getSupportedPaymentMethods();
        return ResponseEntity.ok(methods);
    }

    /**
     * Get payment statistics (ADMIN only)
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/statistics")
    public ResponseEntity<PaymentService.PaymentStats> getPaymentStatistics() {
        PaymentService.PaymentStats stats = paymentService.getPaymentStatistics();
        return ResponseEntity.ok(stats);
    }

    /**
     * Webhook endpoint for payment gateway callbacks (Public - no auth required)
     */
    @PostMapping("/webhook")
    public ResponseEntity<?> handlePaymentWebhook(@RequestBody PaymentWebhookReq webhookData) {
        try {
            paymentService.handlePaymentWebhook(webhookData);
            return ResponseEntity.ok("Webhook processed successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Webhook processing failed");
        }
    }

    /**
     * Manual cleanup of expired payments (ADMIN only)
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/cleanup-expired")
    public ResponseEntity<String> cleanupExpiredPayments() {
        paymentService.cleanupExpiredPayments();
        return ResponseEntity.ok("Expired payments cleaned up");
    }
}