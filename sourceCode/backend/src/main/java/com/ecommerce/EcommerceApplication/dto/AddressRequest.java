package com.ecommerce.EcommerceApplication.dto;

import lombok.Data;

@Data
public class AddressRequest {
    private String recipientName;
    private String phone;
    private String line1;
    private String line2;
    private String subdistrict;
    private String district;
    private String province;
    private String postalCode;
    private String country;
    private Boolean isDefault;  
}
