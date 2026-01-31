package com.ecommerce.EcommerceApplication.service;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.ecommerce.EcommerceApplication.dto.CreateProductRequest;
import com.ecommerce.EcommerceApplication.dto.ProductDto;

public interface ProductService {
    ProductDto create(ProductDto req);
    ProductDto createProduct(Long shopId, CreateProductRequest req);
    Optional<com.ecommerce.EcommerceApplication.entity.Product> updateProduct(Long id, com.ecommerce.EcommerceApplication.entity.Product patch);
    boolean deleteProduct(Long id);

    Page<ProductDto> search(String q, Long categoryId, String status, Pageable pageable);
    ProductDto getBySlug(String slug);
    ProductDto getById(Long id);
    java.util.List<ProductDto> getAllProducts();
    java.util.List<ProductDto> getByShopId(Long shopId);
    ProductDto toDto(com.ecommerce.EcommerceApplication.entity.Product p);
}
