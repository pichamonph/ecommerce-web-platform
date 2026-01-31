package com.ecommerce.EcommerceApplication.dto;

public class CategoryDto {
    public Long id;
    public Long parentId;
    public String name;
    public String slug;
    public String path;
    public Boolean isActive;

    public CategoryDto() {}

    public CategoryDto(Long id, Long parentId, String name, String slug, String path, Boolean isActive) {
        this.id = id;
        this.parentId = parentId;
        this.name = name;
        this.slug = slug;
        this.path = path;
        this.isActive = isActive;
    }
}
