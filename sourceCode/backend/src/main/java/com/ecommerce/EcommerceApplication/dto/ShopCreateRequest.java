package com.ecommerce.EcommerceApplication.dto;

import jakarta.validation.constraints.NotBlank;

public class ShopCreateRequest {
    @NotBlank
    private String name;
    private String description;
    private String logoUrl;

    public ShopCreateRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
}
