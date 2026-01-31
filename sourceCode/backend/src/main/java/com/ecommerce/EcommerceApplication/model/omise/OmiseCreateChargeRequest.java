package com.ecommerce.EcommerceApplication.model.omise;

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;

public class OmiseCreateChargeRequest {

    private long amount;
    private String currency;
    private String description;
    private boolean capture = true;

    @JsonProperty("card")
    private String cardToken;

    private Map<String, Object> source;
    private Map<String, Object> metadata;

    @JsonProperty("return_uri")
    private String returnUri;

    // Constructors
    public OmiseCreateChargeRequest() {}

    public OmiseCreateChargeRequest(long amount, String currency, String description) {
        this.amount = amount;
        this.currency = currency;
        this.description = description;
    }

    // Getters and Setters
    public long getAmount() { return amount; }
    public void setAmount(long amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isCapture() { return capture; }
    public void setCapture(boolean capture) { this.capture = capture; }

    public String getCardToken() { return cardToken; }
    public void setCardToken(String cardToken) { this.cardToken = cardToken; }

    public Map<String, Object> getSource() { return source; }
    public void setSource(Map<String, Object> source) { this.source = source; }

    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }

    public String getReturnUri() { return returnUri; }
    public void setReturnUri(String returnUri) { this.returnUri = returnUri; }
}