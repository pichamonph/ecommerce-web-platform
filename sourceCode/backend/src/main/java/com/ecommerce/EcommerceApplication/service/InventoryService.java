package com.ecommerce.EcommerceApplication.service;

public interface InventoryService {
    boolean reserveStock(Long variantId, int quantity, String reservationId);
    boolean releaseStock(String reservationId);
    boolean commitStock(String reservationId);
    int getAvailable(Long variantId);
}


