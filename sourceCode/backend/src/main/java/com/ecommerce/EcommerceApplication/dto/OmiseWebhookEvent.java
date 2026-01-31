package com.ecommerce.EcommerceApplication.dto;

import java.time.LocalDateTime;
import java.util.Map;

public class OmiseWebhookEvent {

    public String id;
    public String object; // "event"
    public boolean livemode;
    public String location;
    public String key; // Event type like "charge.complete", "charge.failed"
    public LocalDateTime created;
    public Map<String, Object> data; // Event data containing the charge/refund object

    // Getters for common event types
    public boolean isChargeComplete() {
        return "charge.complete".equals(key);
    }

    public boolean isChargeFailed() {
        return "charge.failed".equals(key);
    }

    public boolean isChargeUpdated() {
        return "charge.update".equals(key);
    }

    public boolean isRefundCreated() {
        return "refund.create".equals(key);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getChargeData() {
        if (data != null) {
            return (Map<String, Object>) data.get("object");
        }
        return null;
    }

    public String getChargeId() {
        Map<String, Object> chargeData = getChargeData();
        if (chargeData != null) {
            return (String) chargeData.get("id");
        }
        return null;
    }

    public String getChargeStatus() {
        Map<String, Object> chargeData = getChargeData();
        if (chargeData != null) {
            return (String) chargeData.get("status");
        }
        return null;
    }

    public OmiseWebhookEvent() {}
}