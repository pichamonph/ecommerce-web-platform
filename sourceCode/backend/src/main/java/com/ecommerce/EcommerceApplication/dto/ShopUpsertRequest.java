package com.ecommerce.EcommerceApplication.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ShopUpsertRequest {
    @NotBlank
    private String name;

    private String description;
}
