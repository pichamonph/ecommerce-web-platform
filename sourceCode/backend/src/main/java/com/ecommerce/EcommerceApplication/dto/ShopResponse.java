package com.ecommerce.EcommerceApplication.dto;

public class ShopResponse {
    private Long id;
    private Long ownerId;
    private String name;
    private String description;
    private String logoUrl;
    private String status;
    private boolean suspended;

    public ShopResponse() {}

    public ShopResponse(Long id, Long ownerId, String name, String description, String logoUrl, String status, boolean suspended) {
        this.id = id;
        this.ownerId = ownerId;
        this.name = name;
        this.description = description;
        this.logoUrl = logoUrl;
        this.status = status;
        this.suspended = suspended;
    }

    public static ShopResponseBuilder builder() {
        return new ShopResponseBuilder();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public boolean isSuspended() { return suspended; }
    public void setSuspended(boolean suspended) { this.suspended = suspended; }

    public static class ShopResponseBuilder {
        private Long id;
        private Long ownerId;
        private String name;
        private String description;
        private String logoUrl;
        private String status;
        private boolean suspended;

        ShopResponseBuilder() {}

        public ShopResponseBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public ShopResponseBuilder ownerId(Long ownerId) {
            this.ownerId = ownerId;
            return this;
        }

        public ShopResponseBuilder name(String name) {
            this.name = name;
            return this;
        }

        public ShopResponseBuilder description(String description) {
            this.description = description;
            return this;
        }

        public ShopResponseBuilder logoUrl(String logoUrl) {
            this.logoUrl = logoUrl;
            return this;
        }

        public ShopResponseBuilder status(String status) {
            this.status = status;
            return this;
        }

        public ShopResponseBuilder suspended(boolean suspended) {
            this.suspended = suspended;
            return this;
        }

        public ShopResponse build() {
            return new ShopResponse(id, ownerId, name, description, logoUrl, status, suspended);
        }
    }
}
