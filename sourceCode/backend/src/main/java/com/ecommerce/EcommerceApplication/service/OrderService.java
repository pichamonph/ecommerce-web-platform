package com.ecommerce.EcommerceApplication.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.ecommerce.EcommerceApplication.dto.CheckoutReq;
import com.ecommerce.EcommerceApplication.dto.OrderDto;
import com.ecommerce.EcommerceApplication.entity.OrderStatus;

public interface OrderService {
    OrderDto checkout(Long userId, CheckoutReq req);      // checkout cart into order
    OrderDto getById(Long orderId);
    Page<OrderDto> listByUser(Long userId, Pageable pageable);
    OrderDto updateStatus(Long orderId, String newStatus);

    // For Seller: get orders by shop
    Page<OrderDto> listByShop(Long shopId, Pageable pageable);
    Page<OrderDto> listByShopAndStatus(Long shopId, OrderStatus status, Pageable pageable);
}
