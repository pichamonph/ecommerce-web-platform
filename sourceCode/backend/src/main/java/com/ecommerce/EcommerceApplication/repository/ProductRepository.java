package com.ecommerce.EcommerceApplication.repository;

import java.util.Optional;

import jakarta.persistence.LockModeType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ecommerce.EcommerceApplication.entity.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySlug(String slug);
    boolean existsBySlug(String slug);
    java.util.List<Product> findByShopId(Long shopId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdForUpdate(@Param("id") Long id);

    @Query(value = "SELECT * FROM products p WHERE " +
           "(:q IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', CAST(:q AS TEXT), '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', CAST(:q AS TEXT), '%'))) AND " +
           "(:categoryId IS NULL OR p.category_id = :categoryId) AND " +
           "(:status IS NULL OR p.status = CAST(:status AS TEXT))",
           nativeQuery = true)
    Page<Product> search(
        @Param("q") String q,
        @Param("categoryId") Long categoryId,
        @Param("status") String status,
        Pageable pageable
    );
}
