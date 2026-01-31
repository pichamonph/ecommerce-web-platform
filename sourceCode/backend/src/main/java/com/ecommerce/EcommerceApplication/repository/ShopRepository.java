package com.ecommerce.EcommerceApplication.repository;

import com.ecommerce.EcommerceApplication.model.Shop;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ShopRepository extends JpaRepository<Shop, Long> {

    // เผื่อใช้หน้า Public listing / Admin
    List<Shop> findByStatus(String status);

    // บังคับ 1 ผู้ขาย 1 ร้าน / ตรวจความเป็นเจ้าของ
    boolean existsByOwnerId(Long ownerId);
    Optional<Shop> findByOwnerId(Long ownerId);
    Optional<Shop> findByIdAndOwnerId(Long id, Long ownerId);
}
