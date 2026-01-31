package com.ecommerce.EcommerceApplication.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "order_status_history")
public class OrderStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "order_id", insertable = false, updatable = false)
    private Long orderId;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status")
    private OrderStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false)
    private OrderStatus newStatus;

    @Column(name = "reason")
    private String reason;

    @Column(name = "notes")
    private String notes;

    // Who made the change
    @Column(name = "changed_by_user_id")
    private Long changedByUserId;

    @Column(name = "changed_by_role")
    private String changedByRole; // CUSTOMER, ADMIN, MERCHANT, SYSTEM

    // System tracking
    @Column(name = "automatic_change")
    private Boolean automaticChange = false;

    @Column(name = "external_reference")
    private String externalReference; // Payment ID, Shipment tracking, etc.

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Constructors
    public OrderStatusHistory() {}

    public OrderStatusHistory(Order order, OrderStatus previousStatus, OrderStatus newStatus, String reason) {
        this.order = order;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.reason = reason;
        this.automaticChange = false;
    }

    public OrderStatusHistory(Order order, OrderStatus previousStatus, OrderStatus newStatus,
                            String reason, Long changedByUserId, String changedByRole) {
        this(order, previousStatus, newStatus, reason);
        this.changedByUserId = changedByUserId;
        this.changedByRole = changedByRole;
    }

    // Static factory methods
    public static OrderStatusHistory createSystemChange(Order order, OrderStatus previousStatus,
                                                       OrderStatus newStatus, String reason) {
        OrderStatusHistory history = new OrderStatusHistory(order, previousStatus, newStatus, reason);
        history.automaticChange = true;
        history.changedByRole = "SYSTEM";
        return history;
    }

    public static OrderStatusHistory createUserChange(Order order, OrderStatus previousStatus,
                                                     OrderStatus newStatus, String reason,
                                                     Long userId, String role) {
        return new OrderStatusHistory(order, previousStatus, newStatus, reason, userId, role);
    }

    // Getters and Setters
    public Long getId() { return id; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public Long getOrderId() { return orderId; }

    public OrderStatus getPreviousStatus() { return previousStatus; }
    public void setPreviousStatus(OrderStatus previousStatus) { this.previousStatus = previousStatus; }

    public OrderStatus getNewStatus() { return newStatus; }
    public void setNewStatus(OrderStatus newStatus) { this.newStatus = newStatus; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Long getChangedByUserId() { return changedByUserId; }
    public void setChangedByUserId(Long changedByUserId) { this.changedByUserId = changedByUserId; }

    public String getChangedByRole() { return changedByRole; }
    public void setChangedByRole(String changedByRole) { this.changedByRole = changedByRole; }

    public Boolean getAutomaticChange() { return automaticChange; }
    public void setAutomaticChange(Boolean automaticChange) { this.automaticChange = automaticChange; }

    public String getExternalReference() { return externalReference; }
    public void setExternalReference(String externalReference) { this.externalReference = externalReference; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    // Business methods
    public boolean isSystemChange() {
        return Boolean.TRUE.equals(automaticChange);
    }

    public boolean isUserChange() {
        return !isSystemChange();
    }

    public String getDisplayText() {
        StringBuilder sb = new StringBuilder();

        if (previousStatus != null) {
            sb.append(previousStatus.getThaiName());
            sb.append(" → ");
        }

        sb.append(newStatus.getThaiName());

        if (reason != null && !reason.trim().isEmpty()) {
            sb.append(" (").append(reason).append(")");
        }

        return sb.toString();
    }
}