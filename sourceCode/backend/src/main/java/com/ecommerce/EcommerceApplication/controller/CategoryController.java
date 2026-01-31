package com.ecommerce.EcommerceApplication.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.EcommerceApplication.dto.CategoryDto;
import com.ecommerce.EcommerceApplication.service.CategoryService;

@RestController
@RequestMapping("/categories")
@CrossOrigin
public class CategoryController {

    private final CategoryService service;

    public CategoryController(CategoryService service) {
        this.service = service;
    }

    // สร้าง category (ADMIN only)
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public CategoryDto create(@RequestBody CategoryDto req) {
        return service.create(req);
    }

    // ดู category (Public)
    @GetMapping("/{id}")
    public CategoryDto get(@PathVariable Long id) {
        return service.get(id);
    }

    // แก้ไข category (ADMIN only)
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public CategoryDto update(@PathVariable Long id, @RequestBody CategoryDto req) {
        return service.update(id, req);
    }

    // ลบ category (ADMIN only)
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    // ค้นหา categories (Public)
    @GetMapping
    public Page<CategoryDto> search(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return service.search(q, PageRequest.of(page, size));
    }
}
