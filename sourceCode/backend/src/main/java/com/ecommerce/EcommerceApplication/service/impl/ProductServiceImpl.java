package com.ecommerce.EcommerceApplication.service.impl;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.EcommerceApplication.dto.CreateProductRequest;
import com.ecommerce.EcommerceApplication.dto.ProductDto;
import com.ecommerce.EcommerceApplication.dto.ProductImageDto;
import com.ecommerce.EcommerceApplication.dto.ProductVariantDto;
import com.ecommerce.EcommerceApplication.entity.Product;
import com.ecommerce.EcommerceApplication.entity.ProductImage;
import com.ecommerce.EcommerceApplication.entity.ProductVariant;
import com.ecommerce.EcommerceApplication.repository.ProductRepository;
import com.ecommerce.EcommerceApplication.service.ProductService;
import com.ecommerce.EcommerceApplication.service.ProductVariantService;

@Service
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository repo;
    private final ProductVariantService variantService;

    public ProductServiceImpl(ProductRepository repo, ProductVariantService variantService) {
        this.repo = repo;
        this.variantService = variantService;
    }

    @Override
    public ProductDto create(ProductDto req) {
        Product p = new Product();
        p.setShopId(req.shopId);
        p.setCategoryId(req.categoryId);
        p.setName(req.name);
        p.setDescription(req.description);
        p.setPrice(req.price);
        p.setComparePrice(req.comparePrice);
        p.setSku(req.sku);
        p.setStockQuantity(req.stockQuantity == null ? 0 : req.stockQuantity);
        p.setWeightGram(req.weightGram);
        p.setStatus(req.status == null ? "active" : req.status);

        String baseSlug = (req.slug == null || req.slug.isBlank()) ? slugify(req.name) : slugify(req.slug);
        p.setSlug(uniqueSlug(baseSlug));

        // images (optional)
        if (req.images != null) {
            List<ProductImage> imgs = new ArrayList<>();
            for (ProductImageDto idto : req.images) {
                ProductImage im = new ProductImage();
                im.setProduct(p); // owning side
                im.setUrl(idto.url);
                im.setAltText(idto.altText);
                im.setSortOrder(idto.sortOrder == null ? 0 : idto.sortOrder);
                imgs.add(im);
            }
            p.setImages(imgs);
        }

        repo.save(p);
        return toDto(p);
    }

    @Override
    public ProductDto createProduct(Long shopId, CreateProductRequest req) {
        // Validate required fields
        if (req.name == null || req.name.isBlank()) {
            throw new IllegalArgumentException("Product name is required");
        }
        if (req.price == null || req.price.signum() <= 0) {
            throw new IllegalArgumentException("Product price must be greater than 0");
        }

        Product p = new Product();
        p.setShopId(shopId);
        p.setCategoryId(req.categoryId);
        p.setName(req.name);
        p.setDescription(req.description);
        p.setPrice(req.price);
        p.setComparePrice(req.comparePrice);
        p.setSku(req.sku);
        p.setStockQuantity(req.stockQuantity != null ? req.stockQuantity : 0);
        p.setWeightGram(req.weightGram);
        p.setStatus(req.status != null && !req.status.isBlank() ? req.status : "active");

        // Generate unique slug from name
        String baseSlug = slugify(req.name);
        p.setSlug(uniqueSlug(baseSlug));

        // Save product first to get ID
        p = repo.save(p);

        // Add images if provided (after product has ID)
        if (req.imageUrls != null && !req.imageUrls.isEmpty()) {
            for (int i = 0; i < req.imageUrls.size(); i++) {
                ProductImage img = new ProductImage();
                img.setProduct(p); // Set relationship - JPA will handle product_id
                img.setUrl(req.imageUrls.get(i));
                img.setSortOrder(i);
                img.setIsPrimary(i == 0); // First image is primary
                p.getImages().add(img);
            }
            // Save again with images
            p = repo.save(p);
        }

        return toDto(p);
    }

    @Override
    public Optional<Product> updateProduct(Long id, Product patch) {
        return repo.findById(id).map(p -> {
            if (patch.getName() != null) p.setName(patch.getName());
            if (patch.getDescription() != null) p.setDescription(patch.getDescription());
            if (patch.getPrice() != null) p.setPrice(patch.getPrice());
            if (patch.getComparePrice() != null) p.setComparePrice(patch.getComparePrice());
            if (patch.getSku() != null) p.setSku(patch.getSku());
            if (patch.getStockQuantity() != null) p.setStockQuantity(patch.getStockQuantity());
            if (patch.getWeightGram() != null) p.setWeightGram(patch.getWeightGram());
            if (patch.getStatus() != null) p.setStatus(patch.getStatus());
            if (patch.getCategoryId() != null) p.setCategoryId(patch.getCategoryId());
            if (patch.getShopId() != null) p.setShopId(patch.getShopId());

            // ถ้ามี slug ใหม่ → ทำให้ unique
            if (patch.getSlug() != null && !patch.getSlug().isBlank() && !patch.getSlug().equals(p.getSlug())) {
                p.setSlug(uniqueSlug(slugify(patch.getSlug())));
            }

            // ถ้าคุณต้องการให้ส่งรูปมา “แทนที่ทั้งชุด”
            if (patch.getImages() != null) {
                // orphanRemoval = true ใน Entity จะช่วยลบของเก่าอัตโนมัติถ้า setup ไว้
                p.getImages().clear();
                for (ProductImage newImg : patch.getImages()) {
                    ProductImage im = new ProductImage();
                    im.setProduct(p);
                    im.setUrl(newImg.getUrl());
                    im.setAltText(newImg.getAltText());
                    im.setSortOrder(newImg.getSortOrder() == null ? 0 : newImg.getSortOrder());
                    p.getImages().add(im);
                }
            }

            return repo.save(p);
        });
    }

    @Override
    public boolean deleteProduct(Long id) {
        if (!repo.existsById(id)) return false;
        repo.deleteById(id);
        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductDto> search(String q, Long categoryId, String status, Pageable pageable) {
        Page<Product> page = repo.search(
                (q == null || q.isBlank()) ? null : q.trim(),
                categoryId,
                (status == null || status.isBlank()) ? null : status.trim(),
                pageable
        );
        return page.map(this::toDtoFull);
    }

    private ProductDto toDtoSimple(Product p) {
        ProductDto dto = new ProductDto();
        dto.id = p.getId();
        dto.shopId = p.getShopId();
        dto.categoryId = p.getCategoryId();
        dto.name = p.getName();
        dto.slug = p.getSlug();
        dto.description = p.getDescription();
        dto.price = p.getPrice();
        dto.comparePrice = p.getComparePrice();
        dto.sku = p.getSku();
        dto.stockQuantity = p.getStockQuantity();
        dto.weightGram = p.getWeightGram();
        dto.status = p.getStatus();
        dto.ratingAvg = p.getRatingAvg();
        dto.ratingCount = p.getRatingCount();
        dto.createdAt = p.getCreatedAt();

        dto.hasVariants = false;
        dto.totalStock = p.getStockQuantity();
        dto.minPrice = p.getPrice();
        dto.maxPrice = p.getPrice();
        dto.images = new ArrayList<>();

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDto getBySlug(String slug) {
        Product p = repo.findBySlug(slug).orElseThrow(() -> new IllegalArgumentException("Product not found"));
        return toDto(p);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDto getById(Long id) {
        Product p = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Product not found"));
        return toDto(p);
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<ProductDto> getAllProducts() {
        return repo.findAll().stream().map(this::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<ProductDto> getByShopId(Long shopId) {
        return repo.findByShopId(shopId).stream().map(this::toDto).toList();
    }

    @Override
    public ProductDto toDto(Product p) {
        return toDtoFull(p);
    }

    // -------- helpers --------
    private String slugify(String input) {
        String nowhitespace = input.trim().replaceAll("\\s+", "-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        String slug = normalized.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9-]", "");
        slug = slug.replaceAll("-{2,}", "-");
        slug = slug.replaceAll("^-|-$", "");

        // If slug is empty (e.g., Thai characters), generate a fallback slug
        if (slug.isEmpty()) {
            slug = "product-" + System.currentTimeMillis();
        }

        return slug;
    }

    private String uniqueSlug(String base) {
        // Ensure base is not empty
        if (base == null || base.isEmpty()) {
            base = "product-" + System.currentTimeMillis();
        }

        String s = base;
        int i = 2;
        while (repo.existsBySlug(s)) {
            s = base + "-" + i++;
        }
        return s;
    }

    private ProductDto toDtoFull(Product p) {
        ProductDto dto = new ProductDto();
        dto.id = p.getId();
        dto.shopId = p.getShopId();
        dto.categoryId = p.getCategoryId();
        dto.name = p.getName();
        dto.slug = p.getSlug();
        dto.description = p.getDescription();
        dto.price = p.getPrice();
        dto.comparePrice = p.getComparePrice();
        dto.sku = p.getSku();
        dto.stockQuantity = p.getStockQuantity();
        dto.weightGram = p.getWeightGram();
        dto.status = p.getStatus();
        dto.ratingAvg = p.getRatingAvg();
        dto.ratingCount = p.getRatingCount();
        dto.createdAt = p.getCreatedAt();

        try {
            if (p.getImages() != null) {
                dto.images = p.getImages().stream().map(img -> {
                    ProductImageDto idto = new ProductImageDto();
                    idto.id = img.getId();
                    idto.url = img.getUrl();
                    idto.sortOrder = img.getSortOrder();
                    idto.altText = img.getAltText();
                    return idto;
                }).toList();
            }
        } catch (Exception e) {
            dto.images = new ArrayList<>();
        }

        // Add variant-related data
        try {
            if (p.getVariants() != null && !p.getVariants().isEmpty()) {
                dto.hasVariants = true;
                dto.variants = p.getVariants().stream().map(this::convertVariantToDto).toList();
                dto.totalStock = p.getTotalStock();
                dto.minPrice = p.getMinPrice();
                dto.maxPrice = p.getMaxPrice();
            } else {
                dto.hasVariants = false;
                dto.totalStock = p.getStockQuantity();
                dto.minPrice = p.getPrice();
                dto.maxPrice = p.getPrice();
            }
        } catch (Exception e) {
            dto.hasVariants = false;
            dto.totalStock = p.getStockQuantity();
            dto.minPrice = p.getPrice();
            dto.maxPrice = p.getPrice();
        }

        return dto;
    }

    private ProductVariantDto convertVariantToDto(ProductVariant variant) {
        ProductVariantDto dto = new ProductVariantDto();
        dto.setId(variant.getId());
        dto.setProductId(variant.getProductId());
        dto.setSku(variant.getSku());
        dto.setVariantTitle(variant.getVariantTitle());
        dto.setVariantOptions(variant.getVariantOptions());
        dto.setPrice(variant.getPrice());
        dto.setComparePrice(variant.getComparePrice());
        dto.setEffectivePrice(variant.getEffectivePrice());
        dto.setStockQuantity(variant.getStockQuantity());
        dto.setWeightGram(variant.getWeightGram());
        dto.setStatus(variant.getStatus());
        dto.setPosition(variant.getPosition());
        dto.setAvailable(variant.isAvailable());
        dto.setDisplayName(variant.getDisplayName());
        dto.setCreatedAt(variant.getCreatedAt());
        dto.setUpdatedAt(variant.getUpdatedAt());

        if (variant.getImages() != null && !variant.getImages().isEmpty()) {
            dto.setImageUrls(variant.getImages().stream()
                    .map(img -> img.getImageUrl())
                    .toList());
        }

        return dto;
    }
}
