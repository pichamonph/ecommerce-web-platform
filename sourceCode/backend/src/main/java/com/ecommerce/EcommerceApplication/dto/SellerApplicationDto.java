package com.ecommerce.EcommerceApplication.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SellerApplicationDto {
    private Long id;
    private Long userId;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String displayName;
    private String note;
    private String taxId;
    private String status;
}
