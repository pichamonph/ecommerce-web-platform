package com.ecommerce.EcommerceApplication.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", unique = true, nullable = false)
    private String orderNumber;

    // ในสคีมาปัจจุบันไม่ได้บังคับ NOT NULL ให้ user_id
    // ถ้าธุรกิจคุณต้องการให้ต้องมีผู้ใช้เสมอ ค่อยเปลี่ยนเป็น nullable=false
    @Column(name = "user_id")
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private OrderStatus status = OrderStatus.PENDING;

    // Amounts
    @Column(name = "subtotal", precision = 12, scale = 2, nullable = false)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "shipping_fee", precision = 12, scale = 2, nullable = false)
    private BigDecimal shippingFee = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal taxAmount = BigDecimal.ZERO;

   
    @Column(name = "total_amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    // Address snapshots
    @Column(name = "shipping_address", columnDefinition = "jsonb", nullable = false)
    @JdbcTypeCode(SqlTypes.JSON)
    private String shippingAddress;

    @Column(name = "billing_address", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String billingAddress;

    @Column(name = "notes")
    private String notes;

    // Timestamps
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Items
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    // Payments
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Payment> payments = new ArrayList<>();

    // Status History
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderStatusHistory> statusHistory = new ArrayList<>();

    // ===== getters / setters / helpers =====
    public Long getId() { return id; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public BigDecimal getShippingFee() { return shippingFee; }
    public void setShippingFee(BigDecimal shippingFee) { this.shippingFee = shippingFee; }

    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }

    

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }

    public String getBillingAddress() { return billingAddress; }
    public void setBillingAddress(String billingAddress) { this.billingAddress = billingAddress; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }

    public List<Payment> getPayments() { return payments; }
    public void setPayments(List<Payment> payments) { this.payments = payments; }

    public List<OrderStatusHistory> getStatusHistory() { return statusHistory; }
    public void setStatusHistory(List<OrderStatusHistory> statusHistory) { this.statusHistory = statusHistory; }

    public void addItem(OrderItem item) {
        item.setOrder(this);
        this.items.add(item);
    }

    public void addPayment(Payment payment) {
        payment.setOrder(this);
        this.payments.add(payment);
    }

    public void addStatusHistory(OrderStatusHistory history) {
        history.setOrder(this);
        this.statusHistory.add(history);
    }

    /**
     * Check if order is fully paid
     */
    public boolean isFullyPaid() {
        BigDecimal totalPaid = payments.stream()
            .filter(p -> "COMPLETED".equals(p.getStatus().name()))
            .map(Payment::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return totalPaid.compareTo(this.totalAmount) >= 0;
    }

    /**
     * Change order status with validation and history tracking
     */
    public boolean changeStatus(OrderStatus newStatus, String reason, Long userId, String role) {
        if (this.status == null) {
            this.status = OrderStatus.PENDING;
        }

        // Validate transition
        if (!this.status.canTransitionTo(newStatus)) {
            return false;
        }

        OrderStatus previousStatus = this.status;
        this.status = newStatus;

        // Add history record
        OrderStatusHistory history = OrderStatusHistory.createUserChange(
            this, previousStatus, newStatus, reason, userId, role
        );
        this.addStatusHistory(history);

        return true;
    }

    /**
     * Change order status automatically (system-triggered)
     */
    public boolean changeStatusAutomatically(OrderStatus newStatus, String reason) {
        if (this.status == null) {
            this.status = OrderStatus.PENDING;
        }

        // Validate transition
        if (!this.status.canTransitionTo(newStatus)) {
            return false;
        }

        OrderStatus previousStatus = this.status;
        this.status = newStatus;

        // Add history record
        OrderStatusHistory history = OrderStatusHistory.createSystemChange(
            this, previousStatus, newStatus, reason
        );
        this.addStatusHistory(history);

        return true;
    }

    /**
     * Get current status display name
     */
    public String getStatusDisplayName() {
        return status != null ? status.getDisplayName() : "Unknown";
    }

    /**
     * Get current status Thai name
     */
    public String getStatusThaiName() {
        return status != null ? status.getThaiName() : "ไม่ทราบสถานะ";
    }

    /**
     * Check if order can be cancelled
     */
    public boolean canBeCancelled() {
        return status != null && status.canTransitionTo(OrderStatus.CANCELLED);
    }

    /**
     * Check if order requires payment
     */
    public boolean requiresPayment() {
        return status != null && status.requiresPayment();
    }

    /**
     * Check if order is in progress
     */
    public boolean isInProgress() {
        return status != null && status.isInProgress();
    }

    /**
     * Check if order is completed successfully
     */
    public boolean isSuccessfullyCompleted() {
        return status != null && status.isSuccessfullyCompleted();
    }
}
