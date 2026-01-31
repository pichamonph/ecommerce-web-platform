package com.ecommerce.EcommerceApplication.dto;

import java.math.BigDecimal;

public class CheckoutReq {
    public String shippingAddressJson;  // REQUIRED (string JSON)
    public String billingAddressJson;   // optional
    public BigDecimal shippingFee;      // optional
    public BigDecimal taxAmount;        // optional
     // optional
    public String notes;                // optional
}
