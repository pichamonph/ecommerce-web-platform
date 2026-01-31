package com.ecommerce.EcommerceApplication.dto;

import lombok.Data;

@Data
public class UpdateMeRequest {
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String profileImage;
}
