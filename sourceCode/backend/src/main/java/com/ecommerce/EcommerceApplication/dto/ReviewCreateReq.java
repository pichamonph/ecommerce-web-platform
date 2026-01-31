package com.ecommerce.EcommerceApplication.dto;

import java.util.List;

public class ReviewCreateReq {
    public Long productId;
    public Long orderItemId;       // optional
    public Integer rating;         // 1..5
    public String title;           // optional
    public String comment;         // optional
    public List<String> images;  // optional
}
