package com.ecommerce.EcommerceApplication.service;

import com.ecommerce.EcommerceApplication.dto.ShopCreateRequest;
import com.ecommerce.EcommerceApplication.dto.ShopResponse;
import com.ecommerce.EcommerceApplication.dto.ShopUpdateRequest;
import com.ecommerce.EcommerceApplication.model.Shop;
import com.ecommerce.EcommerceApplication.model.User;
import com.ecommerce.EcommerceApplication.repository.ShopRepository;
import com.ecommerce.EcommerceApplication.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ShopService {

    private final ShopRepository shopRepo;
    private final UserRepository userRepo;

    public ShopService(ShopRepository shopRepo, UserRepository userRepo) {
        this.shopRepo = shopRepo;
        this.userRepo = userRepo;
    }

    private ShopResponse toDto(Shop s) {
        return ShopResponse.builder()
                .id(s.getId())
                .ownerId(s.getOwner().getId())
                .name(s.getName())
                .description(s.getDescription())
                .logoUrl(s.getLogoUrl())
                .status(s.getStatus())
                .suspended(s.isSuspended())
                .build();
    }

    private String generateSlug(String name) {
        String slug = name.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
        return slug.isEmpty() ? "shop-" + System.currentTimeMillis() : slug;
    }

    @Transactional
    public ShopResponse create(Long sellerId, ShopCreateRequest req) {
        User owner = userRepo.findById(sellerId)
                .orElseThrow(() -> new IllegalArgumentException("user not found"));

        if (shopRepo.existsByOwnerId(sellerId)) {
            throw new IllegalStateException("shop already exists");
        }

        Shop s = new Shop();
        s.setOwner(owner);
        s.setSellerUserId(sellerId);
        s.setName(req.getName());
        s.setSlug(generateSlug(req.getName()));
        s.setDescription(req.getDescription());
        s.setLogoUrl(req.getLogoUrl());
        if (s.getStatus() == null) {
            s.setStatus("ACTIVE");
        }
        s = shopRepo.save(s);
        return toDto(s);
    }

    @Transactional(readOnly = true)
    public List<ShopResponse> listActive() {
        return shopRepo.findByStatus("ACTIVE").stream()
                .map(this::toDto)
                .toList();

    }

    @Transactional(readOnly = true)
    public ShopResponse get(Long id) {
        return shopRepo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new IllegalArgumentException("shop not found"));
    }

    @Transactional(readOnly = true)
    public ShopResponse getByOwnerId(Long ownerId) {
        return shopRepo.findByOwnerId(ownerId)
                .map(this::toDto)
                .orElse(null);  // Return null if seller doesn't have a shop yet
    }

    @Transactional
    public ShopResponse update(Long actorId, Long shopId, ShopUpdateRequest req, boolean actorIsAdmin) {
        Shop s = shopRepo.findById(shopId)
                .orElseThrow(() -> new IllegalArgumentException("shop not found"));

        if (!actorIsAdmin && !s.getOwner().getId().equals(actorId)) {
            throw new AccessDeniedException("not owner");
        }

        if (req.getName() != null) s.setName(req.getName());
        if (req.getDescription() != null) s.setDescription(req.getDescription());
        if (req.getLogoUrl() != null) s.setLogoUrl(req.getLogoUrl());

        s = shopRepo.save(s);
        return toDto(s);
    }

    @Transactional
    public ShopResponse suspendByAdmin(Long adminId, Long shopId, String reason) {
        Shop s = shopRepo.findById(shopId)
                .orElseThrow(() -> new IllegalArgumentException("shop not found"));

        s.setStatus("SUSPENDED");
        s.setSuspended(true);

        if (reason != null && !reason.isBlank()) {
            String prefix = "[SUSPENDED:" + reason + "]";
            s.setDescription((s.getDescription() == null || s.getDescription().isBlank())
                    ? prefix
                    : s.getDescription() + " " + prefix);
        }

        s = shopRepo.save(s);
        return toDto(s);
    }

    @Transactional
    public ShopResponse unsuspendByAdmin(Long adminId, Long shopId) {
        Shop s = shopRepo.findById(shopId)
                .orElseThrow(() -> new IllegalArgumentException("shop not found"));

        s.setStatus("ACTIVE");
        s.setSuspended(false);

        s = shopRepo.save(s);
        return toDto(s);
    }
}
