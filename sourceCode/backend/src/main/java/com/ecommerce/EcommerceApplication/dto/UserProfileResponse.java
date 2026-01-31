package com.ecommerce.EcommerceApplication.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @AllArgsConstructor @NoArgsConstructor
public class UserProfileResponse {
    private Long id;
    private String username;
    private String email;
    private String role;
}
