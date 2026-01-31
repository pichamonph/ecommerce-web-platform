package com.ecommerce.EcommerceApplication.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ecommerce.EcommerceApplication.entity.CartItem;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    // อ่านรายการในตะกร้า
    List<CartItem> findByCartId(Long cartId);

    // อ่านรายการพร้อม product, variant สำหรับ cart display
    // Note: ไม่ fetch images เพราะ Hibernate ไม่รองรับ multiple bag fetch
    @Query("SELECT DISTINCT ci FROM CartItem ci " +
           "LEFT JOIN FETCH ci.product p " +
           "LEFT JOIN FETCH p.shop " +
           "LEFT JOIN FETCH ci.variant v " +
           "WHERE ci.cart.id = :cartId")
    List<CartItem> findByCartIdWithDetails(@Param("cartId") Long cartId);

    // ล้างทั้งตะกร้า
    void deleteByCartId(Long cartId);

    // หา/เช็คสินค้าที่ซ้ำในตะกร้า
    boolean existsByCartIdAndProductId(Long cartId, Long productId);
    Optional<CartItem> findByCartIdAndProductId(Long cartId, Long productId);

    // หา/เช็คสินค้า variants ที่ซ้ำในตะกร้า
    Optional<CartItem> findByCartIdAndProductIdAndVariantId(Long cartId, Long productId, Long variantId);
    Optional<CartItem> findByCartIdAndVariantId(Long cartId, Long variantId);
    boolean existsByCartIdAndVariantId(Long cartId, Long variantId);

    // ลบแบบผูก cartId ให้ปลอดภัยและอะตอมมิก
    long deleteByIdAndCartId(Long itemId, Long cartId);

    // (เผื่ออยากคืนข้อมูลก่อนลบ)
    Optional<CartItem> findByIdAndCartId(Long itemId, Long cartId);
}
