package com.ecommerce.EcommerceApplication.entity;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Order Status Enum with workflow management
 * Defines valid order statuses and their allowed transitions
 */
public enum OrderStatus {

    // Order Creation Phase
    PENDING("Pending", "รอดำเนินการ", "Order created, waiting for payment", 1),

    // Payment Phase
    PAYMENT_PENDING("Payment Pending", "รอชำระเงิน", "Payment initiated, waiting for confirmation", 2),
    PAID("Paid", "ชำระแล้ว", "Payment completed successfully", 3),
    PAYMENT_FAILED("Payment Failed", "ชำระไม่สำเร็จ", "Payment failed or declined", 4),

    // Processing Phase
    CONFIRMED("Confirmed", "ยืนยันแล้ว", "Order confirmed by merchant", 5),
    PROCESSING("Processing", "กำลังดำเนินการ", "Order is being prepared", 6),

    // Fulfillment Phase
    READY_TO_SHIP("Ready to Ship", "พร้อมจัดส่ง", "Items ready for shipping", 7),
    SHIPPED("Shipped", "จัดส่งแล้ว", "Order has been shipped", 8),
    OUT_FOR_DELIVERY("Out for Delivery", "กำลังจัดส่ง", "Order is out for delivery", 9),
    DELIVERED("Delivered", "จัดส่งสำเร็จ", "Order delivered successfully", 10),

    // Completion Phase
    COMPLETED("Completed", "เสร็จสิ้น", "Order completed successfully", 11),

    // Problem/Cancel Phase
    CANCELLED("Cancelled", "ยกเลิก", "Order cancelled", -1),
    REFUNDED("Refunded", "คืนเงินแล้ว", "Order refunded", -2),
    RETURNED("Returned", "ส่งคืนแล้ว", "Order returned by customer", -3),

    // Special Cases
    ON_HOLD("On Hold", "ระงับ", "Order is on hold", 0),
    DISPUTED("Disputed", "ร้องเรียน", "Order is under dispute", -4);

    private final String displayName;
    private final String thaiName;
    private final String description;
    private final int orderSequence; // For ordering states (-ve for terminal/problem states)

    OrderStatus(String displayName, String thaiName, String description, int orderSequence) {
        this.displayName = displayName;
        this.thaiName = thaiName;
        this.description = description;
        this.orderSequence = orderSequence;
    }

    // Getters
    public String getDisplayName() { return displayName; }
    public String getThaiName() { return thaiName; }
    public String getDescription() { return description; }
    public int getOrderSequence() { return orderSequence; }

    // Define allowed transitions for each status
    private static final Map<OrderStatus, Set<OrderStatus>> ALLOWED_TRANSITIONS;

    static {
        Map<OrderStatus, Set<OrderStatus>> transitions = new HashMap<>();

        // From PENDING (allow CONFIRMED for COD/direct confirmation)
        transitions.put(PENDING, Set.of(PAYMENT_PENDING, PAID, CONFIRMED, CANCELLED, ON_HOLD));

        // From PAYMENT_PENDING
        transitions.put(PAYMENT_PENDING, Set.of(PAID, PAYMENT_FAILED, CANCELLED));

        // From PAID
        transitions.put(PAID, Set.of(CONFIRMED, CANCELLED, REFUNDED));

        // From PAYMENT_FAILED
        transitions.put(PAYMENT_FAILED, Set.of(PAYMENT_PENDING, CANCELLED));

        // From CONFIRMED
        transitions.put(CONFIRMED, Set.of(PROCESSING, READY_TO_SHIP, CANCELLED, REFUNDED));

        // From PROCESSING
        transitions.put(PROCESSING, Set.of(READY_TO_SHIP, ON_HOLD, CANCELLED, REFUNDED));

        // From READY_TO_SHIP
        transitions.put(READY_TO_SHIP, Set.of(SHIPPED, ON_HOLD, CANCELLED));

        // From SHIPPED (allow DELIVERED for customer confirmation)
        transitions.put(SHIPPED, Set.of(OUT_FOR_DELIVERY, DELIVERED, RETURNED));

        // From OUT_FOR_DELIVERY
        transitions.put(OUT_FOR_DELIVERY, Set.of(DELIVERED, RETURNED, DISPUTED));

        // From DELIVERED
        transitions.put(DELIVERED, Set.of(COMPLETED, RETURNED, DISPUTED));

        // From ON_HOLD
        transitions.put(ON_HOLD, Set.of(PENDING, CONFIRMED, PROCESSING, CANCELLED));

        // Terminal states generally don't transition (except for specific cases)
        transitions.put(COMPLETED, Set.of(DISPUTED, RETURNED));
        transitions.put(CANCELLED, Collections.emptySet()); // No transitions from cancelled
        transitions.put(REFUNDED, Collections.emptySet()); // No transitions from refunded
        transitions.put(RETURNED, Set.of(REFUNDED));
        transitions.put(DISPUTED, Set.of(COMPLETED, CANCELLED, REFUNDED));

        ALLOWED_TRANSITIONS = Collections.unmodifiableMap(transitions);
    }

    /**
     * Check if transition from current status to new status is allowed
     */
    public boolean canTransitionTo(OrderStatus newStatus) {
        return ALLOWED_TRANSITIONS.getOrDefault(this, Set.of()).contains(newStatus);
    }

    /**
     * Get all allowed next statuses from current status
     */
    public Set<OrderStatus> getAllowedTransitions() {
        return ALLOWED_TRANSITIONS.getOrDefault(this, Set.of());
    }

    /**
     * Check if this status is a terminal status (no further transitions)
     */
    public boolean isTerminal() {
        return getAllowedTransitions().isEmpty();
    }

    /**
     * Check if this status indicates a problem/failed state
     */
    public boolean isProblemStatus() {
        return orderSequence < 0;
    }

    /**
     * Check if this status requires payment
     */
    public boolean requiresPayment() {
        return this == PENDING || this == PAYMENT_PENDING;
    }

    /**
     * Check if this status indicates order is in progress
     */
    public boolean isInProgress() {
        return orderSequence > 0 && orderSequence < 11;
    }

    /**
     * Check if this status indicates order is completed successfully
     */
    public boolean isSuccessfullyCompleted() {
        return this == COMPLETED;
    }

    /**
     * Get statuses that are considered active (not terminal)
     */
    public static List<OrderStatus> getActiveStatuses() {
        return Arrays.stream(values())
                .filter(status -> !status.isTerminal())
                .collect(Collectors.toList());
    }

    /**
     * Get statuses in order sequence
     */
    public static List<OrderStatus> getStatusesBySequence() {
        return Arrays.stream(values())
                .sorted((a, b) -> Integer.compare(a.orderSequence, b.orderSequence))
                .collect(Collectors.toList());
    }

    /**
     * Convert from string (for backward compatibility)
     */
    public static OrderStatus fromString(String status) {
        if (status == null) return PENDING;

        // Handle legacy string statuses
        return switch (status.toLowerCase()) {
            case "pending" -> PENDING;
            case "paid" -> PAID;
            case "confirmed" -> CONFIRMED;
            case "processing" -> PROCESSING;
            case "shipped" -> SHIPPED;
            case "delivered" -> DELIVERED;
            case "completed" -> COMPLETED;
            case "cancelled" -> CANCELLED;
            case "refunded" -> REFUNDED;
            default -> {
                try {
                    yield valueOf(status.toUpperCase());
                } catch (IllegalArgumentException e) {
                    yield PENDING; // Default fallback
                }
            }
        };
    }

    /**
     * Get status color for UI (CSS classes)
     */
    public String getStatusColor() {
        return switch (this) {
            case PENDING, PAYMENT_PENDING -> "warning";
            case PAID, CONFIRMED -> "info";
            case PROCESSING, READY_TO_SHIP -> "primary";
            case SHIPPED, OUT_FOR_DELIVERY -> "secondary";
            case DELIVERED, COMPLETED -> "success";
            case CANCELLED, PAYMENT_FAILED, RETURNED -> "danger";
            case REFUNDED -> "dark";
            case ON_HOLD, DISPUTED -> "warning";
        };
    }
}