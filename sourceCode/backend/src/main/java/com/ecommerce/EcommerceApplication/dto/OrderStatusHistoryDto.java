package com.ecommerce.EcommerceApplication.dto;

import java.time.LocalDateTime;

import com.ecommerce.EcommerceApplication.entity.OrderStatus;
import com.ecommerce.EcommerceApplication.entity.OrderStatusHistory;

public class OrderStatusHistoryDto {

    private Long id;
    private Long orderId;
    private OrderStatus previousStatus;
    private OrderStatus newStatus;
    private String reason;
    private String notes;
    private Long changedByUserId;
    private String changedByRole;
    private Boolean automaticChange;
    private String externalReference;
    private LocalDateTime createdAt;

    // Constructors
    public OrderStatusHistoryDto() {}

    public OrderStatusHistoryDto(OrderStatusHistory entity) {
        this.id = entity.getId();
        this.orderId = entity.getOrderId();
        this.previousStatus = entity.getPreviousStatus();
        this.newStatus = entity.getNewStatus();
        this.reason = entity.getReason();
        this.notes = entity.getNotes();
        this.changedByUserId = entity.getChangedByUserId();
        this.changedByRole = entity.getChangedByRole();
        this.automaticChange = entity.getAutomaticChange();
        this.externalReference = entity.getExternalReference();
        this.createdAt = entity.getCreatedAt();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

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
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Business methods
    public boolean isSystemChange() {
        return Boolean.TRUE.equals(automaticChange);
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

    // Status display names
    public String getPreviousStatusDisplayName() {
        return previousStatus != null ? previousStatus.getDisplayName() : null;
    }

    public String getPreviousStatusThaiName() {
        return previousStatus != null ? previousStatus.getThaiName() : null;
    }

    public String getNewStatusDisplayName() {
        return newStatus != null ? newStatus.getDisplayName() : "Unknown";
    }

    public String getNewStatusThaiName() {
        return newStatus != null ? newStatus.getThaiName() : "ไม่ทราบสถานะ";
    }
}