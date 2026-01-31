package com.ecommerce.EcommerceApplication.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.ecommerce.EcommerceApplication.dto.CategoryDto;

public interface CategoryService {
    CategoryDto create(CategoryDto req);
    CategoryDto update(Long id, CategoryDto req);
    void delete(Long id);
    CategoryDto get(Long id);
    Page<CategoryDto> search(String q, Pageable pageable);
}
