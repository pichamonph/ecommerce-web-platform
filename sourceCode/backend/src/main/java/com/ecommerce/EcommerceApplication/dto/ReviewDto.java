package com.ecommerce.EcommerceApplication.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ReviewDto {
    public Long id;
    public Long productId;
    public String productName;    // For seller to see product name
    public Long userId;
    public String userName;        // For seller to see customer name
    public String userProfileImage; // User profile image URL
    public Long orderItemId;
    public Integer rating;
    public String title;
    public String comment;
    public List<String> images; // แปลงจาก/เป็น JSON array
    public Boolean isVerified;
    public String shopReply;
    public LocalDateTime shopReplyAt;
    public LocalDateTime createdAt;
}
