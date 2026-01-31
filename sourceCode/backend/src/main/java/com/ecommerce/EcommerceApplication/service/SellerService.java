package com.ecommerce.EcommerceApplication.service;

import com.ecommerce.EcommerceApplication.dto.SellerApplicationResponse;
import com.ecommerce.EcommerceApplication.dto.SellerApplyRequest;
import com.ecommerce.EcommerceApplication.model.SellerApplication;
import com.ecommerce.EcommerceApplication.repository.SellerApplicationRepository;
import com.ecommerce.EcommerceApplication.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class SellerService {

    private final SellerApplicationRepository sellerAppRepo;
    private final UserRepository userRepo;

    @Transactional
    public SellerApplicationResponse apply(Long userId, SellerApplyRequest req) {
        var user = userRepo.findById(userId).orElseThrow();
        if ("SELLER".equalsIgnoreCase(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "already a seller");
        }
        var last = sellerAppRepo.findTopByUserIdOrderByIdDesc(userId).orElse(null);
        if (last != null && "PENDING".equalsIgnoreCase(last.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "application already pending");
        }

        var app = new SellerApplication();
        app.setUser(user);
        app.setDisplayName(req.getDisplayName());
        app.setNote(req.getNote());
        app.setTaxId(req.getTaxId());
        app.setStatus("PENDING");
        app = sellerAppRepo.save(app);

        return SellerApplicationResponse.builder()
                .id(app.getId())
                .userId(user.getId())
                .displayName(app.getDisplayName())
                .status(app.getStatus())
                .build();
    }

    @Transactional
    public void approve(Long adminId, Long targetUserId) {
        var user = userRepo.findById(targetUserId).orElseThrow();

        var app = sellerAppRepo.findTopByUserIdOrderByIdDesc(targetUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "no application"));

        if (!"PENDING".equalsIgnoreCase(app.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "application not pending");
        }

        app.setStatus("APPROVED");
        sellerAppRepo.save(app);

        user.setRole("ROLE_SELLER");
        userRepo.save(user);
    }
}
