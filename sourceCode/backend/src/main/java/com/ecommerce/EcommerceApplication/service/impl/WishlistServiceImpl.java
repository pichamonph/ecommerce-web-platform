package com.ecommerce.EcommerceApplication.service.impl;

import com.ecommerce.EcommerceApplication.config.AppConfig;
import com.ecommerce.EcommerceApplication.dto.ProductDto;
import com.ecommerce.EcommerceApplication.dto.ProductImageDto;
import com.ecommerce.EcommerceApplication.dto.WishlistDto;
import com.ecommerce.EcommerceApplication.entity.Product;
import com.ecommerce.EcommerceApplication.entity.ProductImage;
import com.ecommerce.EcommerceApplication.entity.Wishlist;
import com.ecommerce.EcommerceApplication.repository.ProductRepository;
import com.ecommerce.EcommerceApplication.repository.WishlistRepository;
import com.ecommerce.EcommerceApplication.service.WishlistService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
@Transactional
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepo;
    private final ProductRepository productRepo;
    private final AppConfig appConfig;

    public WishlistServiceImpl(WishlistRepository wishlistRepo, ProductRepository productRepo, AppConfig appConfig) {
        this.wishlistRepo = wishlistRepo;
        this.productRepo = productRepo;
        this.appConfig = appConfig;
    }

    @Override
    public WishlistDto addToWishlist(Long userId, Long productId) {
        // ตรวจสอบว่าสินค้าอยู่ใน wishlist แล้วหรือไม่
        if (wishlistRepo.existsByUserIdAndProduct_Id(userId, productId)) {
            throw new IllegalArgumentException("Product is already in wishlist");
        }

        // ตรวจสอบว่าสินค้ามีอยู่จริง
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        // สร้าง wishlist item ใหม่
        Wishlist wishlist = new Wishlist();
        wishlist.setUserId(userId);
        wishlist.setProduct(product);

        wishlistRepo.save(wishlist);
        return toDto(wishlist);
    }

    @Override
    public boolean removeFromWishlist(Long userId, Long productId) {
        if (!wishlistRepo.existsByUserIdAndProduct_Id(userId, productId)) {
            return false;
        }
        wishlistRepo.deleteByUserIdAndProduct_Id(userId, productId);
        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<WishlistDto> getUserWishlist(Long userId, Pageable pageable) {
        return wishlistRepo.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isInWishlist(Long userId, Long productId) {
        return wishlistRepo.existsByUserIdAndProduct_Id(userId, productId);
    }

    @Override
    @Transactional(readOnly = true)
    public long getWishlistCount(Long userId) {
        return wishlistRepo.countByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Object[]> getMostWishlistedProducts(Pageable pageable) {
        return wishlistRepo.findMostWishlistedProducts(pageable);
    }

    // ---------- helpers ----------
    private WishlistDto toDto(Wishlist wishlist) {
        WishlistDto dto = new WishlistDto();
        dto.id = wishlist.getId();
        dto.userId = wishlist.getUserId();
        dto.createdAt = wishlist.getCreatedAt();

        // แปลง Product เป็น ProductDto
        if (wishlist.getProduct() != null) {
            dto.product = toProductDto(wishlist.getProduct());
        }

        return dto;
    }

    private ProductDto toProductDto(Product product) {
        ProductDto dto = new ProductDto();
        dto.id = product.getId();
        dto.name = product.getName();
        dto.slug = product.getSlug();
        dto.description = product.getDescription();
        dto.price = product.getPrice();
        dto.comparePrice = product.getComparePrice();
        dto.sku = product.getSku();
        dto.stockQuantity = product.getStockQuantity();
        dto.status = product.getStatus();
        dto.ratingAvg = product.getRatingAvg();
        dto.ratingCount = product.getRatingCount();
        dto.createdAt = product.getCreatedAt();
        dto.shopId = product.getShopId();
        dto.categoryId = product.getCategoryId();

        // แปลง images และแปลง URL เป็น full URL
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            dto.images = product.getImages().stream()
                .map(this::toImageDto)
                .collect(Collectors.toList());
        }

        return dto;
    }

    private ProductImageDto toImageDto(ProductImage image) {
        ProductImageDto dto = new ProductImageDto();
        dto.id = image.getId();
        dto.url = appConfig.buildFileUrl(image.getUrl());
        dto.sortOrder = image.getSortOrder();
        return dto;
    }
}