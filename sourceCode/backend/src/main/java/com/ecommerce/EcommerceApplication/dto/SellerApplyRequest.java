package com.ecommerce.EcommerceApplication.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SellerApplyRequest {
    @NotBlank
    private String displayName;   
    private String note;          
    private String taxId;         
}
