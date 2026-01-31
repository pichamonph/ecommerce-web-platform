package com.ecommerce.EcommerceApplication.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class SellerApplicationResponse {
    Long id;
    Long userId;
    String displayName;
    String status;   
}
