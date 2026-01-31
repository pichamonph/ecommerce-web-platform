package com.ecommerce.EcommerceApplication.service;

import com.ecommerce.EcommerceApplication.dto.ReviewCreateReq;
import com.ecommerce.EcommerceApplication.dto.ReviewDto;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewService {
    ReviewDto create(Long userId, ReviewCreateReq req);
    Page<ReviewDto> listByProduct(Long productId, Pageable pageable);
    ReviewDto addShopReply(Long reviewId, Long shopId, String replyText);   // ร้านค้าตอบกลับรีวิว

    // For Seller: Get reviews by shop
    Page<ReviewDto> listByShop(Long shopId, Pageable pageable);
}
