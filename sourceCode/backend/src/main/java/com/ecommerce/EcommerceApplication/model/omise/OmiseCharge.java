package com.ecommerce.EcommerceApplication.model.omise;

import java.time.LocalDateTime;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;

public class OmiseCharge {

    private String id;
    private String object;
    private boolean livemode;
    private String location;
    private long amount;
    private String currency;
    private String description;
    private String status;
    private boolean paid;
    private String transaction;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @JsonProperty("paid_at")
    private LocalDateTime paidAt;

    @JsonProperty("authorize_uri")
    private String authorizeUri;

    @JsonProperty("return_uri")
    private String returnUri;

    private OmiseSource source;
    private Map<String, Object> metadata;

    // Constructors
    public OmiseCharge() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getObject() { return object; }
    public void setObject(String object) { this.object = object; }

    public boolean isLivemode() { return livemode; }
    public void setLivemode(boolean livemode) { this.livemode = livemode; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public long getAmount() { return amount; }
    public void setAmount(long amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public boolean isPaid() { return paid; }
    public void setPaid(boolean paid) { this.paid = paid; }

    public String getTransaction() { return transaction; }
    public void setTransaction(String transaction) { this.transaction = transaction; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }

    public String getAuthorizeUri() { return authorizeUri; }
    public void setAuthorizeUri(String authorizeUri) { this.authorizeUri = authorizeUri; }

    public String getReturnUri() { return returnUri; }
    public void setReturnUri(String returnUri) { this.returnUri = returnUri; }

    public OmiseSource getSource() { return source; }
    public void setSource(OmiseSource source) { this.source = source; }

    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }

    // Additional getter methods for compatibility
    public Boolean getPaid() { return paid; }
    public LocalDateTime getCreated() { return createdAt; }

    public static class OmiseSource {
        private String id;
        private String object;
        private String type;
        private String flow;
        private long amount;
        private String currency;

        @JsonProperty("scannable_code")
        private OmiseScannableCode scannableCode;

        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getObject() { return object; }
        public void setObject(String object) { this.object = object; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getFlow() { return flow; }
        public void setFlow(String flow) { this.flow = flow; }

        public long getAmount() { return amount; }
        public void setAmount(long amount) { this.amount = amount; }

        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }

        public OmiseScannableCode getScannableCode() { return scannableCode; }
        public void setScannableCode(OmiseScannableCode scannableCode) { this.scannableCode = scannableCode; }
    }

    public static class OmiseScannableCode {
        private String type;
        private String image;
        private String value;

        // Getters and Setters
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getImage() { return image; }
        public void setImage(String image) { this.image = image; }

        public String getValue() { return value; }
        public void setValue(String value) { this.value = value; }
    }
}