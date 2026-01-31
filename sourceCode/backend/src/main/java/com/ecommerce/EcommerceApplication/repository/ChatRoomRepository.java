package com.ecommerce.EcommerceApplication.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.ecommerce.EcommerceApplication.entity.ChatRoom;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    Optional<ChatRoom> findByBuyerUserIdAndShopIdAndOrderId(Long buyerUserId, Long shopId, Long orderId);
    Page<ChatRoom> findByBuyerUserId(Long buyerUserId, Pageable pageable);
    Page<ChatRoom> findByShopId(Long shopId, Pageable pageable);
}
