package com.ecommerce.EcommerceApplication.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ShopDto {
    private Long id;
    private Long ownerId;
    private String ownerUsername;
    private String ownerEmail;
    private String name;
    private String description;
    private String logoUrl;
    private String status;
    private boolean suspended;
    private Instant createdAt;
    private Instant updatedAt;
}
