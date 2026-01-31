package com.ecommerce.EcommerceApplication.service.impl;

import java.text.Normalizer;
import java.util.Locale;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.EcommerceApplication.dto.CategoryDto;
import com.ecommerce.EcommerceApplication.entity.Category;
import com.ecommerce.EcommerceApplication.repository.CategoryRepository;
import com.ecommerce.EcommerceApplication.service.CategoryService;

@Service
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository repo;

    public CategoryServiceImpl(CategoryRepository repo) {
        this.repo = repo;
    }

    @Override
    public CategoryDto create(CategoryDto req) {
        Category entity = new Category();
        entity.setName(req.name);
        entity.setParentId(req.parentId);
        entity.setIsActive(req.isActive == null ? true : req.isActive);

        String baseSlug = (req.slug == null || req.slug.isBlank()) ? slugify(req.name) : slugify(req.slug);
        entity.setSlug(uniqueSlug(baseSlug));
        entity.setPath(buildPath(entity.getParentId(), entity.getSlug()));

        repo.save(entity);
        return toDto(entity);
    }

    @Override
    public CategoryDto update(Long id, CategoryDto req) {
        Category entity = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Category not found"));
        if (req.name != null) entity.setName(req.name);
        if (req.parentId != null) entity.setParentId(req.parentId);
        if (req.isActive != null) entity.setIsActive(req.isActive);

        if (req.slug != null && !req.slug.isBlank() && !req.slug.equals(entity.getSlug())) {
            String newSlug = uniqueSlug(slugify(req.slug));
            entity.setSlug(newSlug);
        }

        // อัปเดต path หาก parent หรือ slug เปลี่ยน
        entity.setPath(buildPath(entity.getParentId(), entity.getSlug()));

        repo.save(entity);
        return toDto(entity);
    }

    @Override
    public void delete(Long id) {
        if (!repo.existsById(id)) throw new IllegalArgumentException("Category not found");
        repo.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryDto get(Long id) {
        Category c = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Category not found"));
        return toDto(c);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CategoryDto> search(String q, Pageable pageable) {
        // ตัวอย่างเรียบง่าย: ใช้ name LIKE ผ่าน query method ของ Spring Data (ใช้ Page.map)
        Page<Category> page = (q == null || q.isBlank())
                ? repo.findAll(pageable)
                : repo.findAll(pageable) // TODO: ปรับเป็น @Query ถ้าต้องการ like จริง
        ;
        return page.map(this::toDto);
    }

    // ---------- helpers ----------
    private CategoryDto toDto(Category c) {
        return new CategoryDto(c.getId(), c.getParentId(), c.getName(), c.getSlug(), c.getPath(), c.getIsActive());
    }

    private String buildPath(Long parentId, String slug) {
        if (parentId == null) return slug;
        Optional<Category> parentOpt = repo.findById(parentId);
        String parentPath = parentOpt.map(Category::getPath).orElse("");
        return (parentPath == null || parentPath.isBlank()) ? slug : parentPath + "/" + slug;
    }

    private String slugify(String input) {
        String nowhitespace = input.trim().replaceAll("\\s+", "-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        String slug = normalized.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9-]", "");
        slug = slug.replaceAll("-{2,}", "-");
        return slug.replaceAll("^-|-$", "");
    }

    private String uniqueSlug(String base) {
        String s = base;
        int i = 2;
        while (repo.existsBySlug(s)) {
            s = base + "-" + i++;
        }
        return s;
    }
}
