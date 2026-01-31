package com.ecommerce.EcommerceApplication.service;

import com.ecommerce.EcommerceApplication.dto.*;
import com.ecommerce.EcommerceApplication.model.Address;
import com.ecommerce.EcommerceApplication.model.User;
import com.ecommerce.EcommerceApplication.repository.AddressRepository;
import com.ecommerce.EcommerceApplication.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepo;
    private final UserRepository userRepo;

    public List<AddressResponse> list(Long userId) {
        return addressRepo.findByUser_IdOrderByIdAsc(userId).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public AddressResponse create(Long userId, CreateAddressRequest req) {
        User u = userRepo.findById(userId).orElseThrow();

        boolean first = addressRepo.countByUser_Id(userId) == 0;
        boolean wantDefault = Boolean.TRUE.equals(req.getIsDefault()) || first;

        Address a = Address.builder()
                .user(u)
                .recipientName(req.getRecipientName())
                .phone(req.getPhone())
                .line1(req.getLine1())
                .line2(req.getLine2())
                .subdistrict(req.getSubdistrict())
                .district(req.getDistrict())
                .province(req.getProvince())
                .postalCode(req.getPostalCode())
                .country(req.getCountry())
                .isDefault(wantDefault)
                .build();

        Address saved = addressRepo.save(a);

        if (wantDefault) {
            addressRepo.clearDefaultForUserExcept(userId, saved.getId());
            saved.setIsDefault(true);
        }
        return toDto(saved);
    }

    @Transactional
    public AddressResponse update(Long userId, Long addressId, UpdateAddressRequest req) {
        Address a = addressRepo.findByIdAndUser_Id(addressId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "address not found"));

        if (req.getRecipientName() != null) a.setRecipientName(req.getRecipientName());
        if (req.getPhone() != null) a.setPhone(req.getPhone());
        if (req.getLine1() != null) a.setLine1(req.getLine1());
        if (req.getLine2() != null) a.setLine2(req.getLine2());
        if (req.getSubdistrict() != null) a.setSubdistrict(req.getSubdistrict());
        if (req.getDistrict() != null) a.setDistrict(req.getDistrict());
        if (req.getProvince() != null) a.setProvince(req.getProvince());
        if (req.getPostalCode() != null) a.setPostalCode(req.getPostalCode());
        if (req.getCountry() != null) a.setCountry(req.getCountry());

        if (req.getIsDefault() != null) {
            if (req.getIsDefault()) {
                addressRepo.clearDefaultForUserExcept(userId, a.getId());
                a.setIsDefault(true);
            } else {
                var currentDefault = addressRepo.findFirstByUser_IdAndIsDefaultTrue(userId);
                if (currentDefault.isPresent() && currentDefault.get().getId().equals(a.getId())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "must keep at least one default address");
                }
                a.setIsDefault(false);
            }
        }
        return toDto(a);
    }

    @Transactional
    public void delete(Long userId, Long addressId) {
        Address a = addressRepo.findByIdAndUser_Id(addressId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "address not found"));

        boolean wasDefault = Boolean.TRUE.equals(a.getIsDefault());
        addressRepo.delete(a);

        if (wasDefault) {
            addressRepo.findFirstByUser_IdOrderByIdAsc(userId)
                    .ifPresent(next -> {
                        next.setIsDefault(true);
                        addressRepo.clearDefaultForUserExcept(userId, next.getId());
                    });
        }
    }

    private AddressResponse toDto(Address a) {
        return AddressResponse.builder()
                .id(a.getId())
                .recipientName(a.getRecipientName())
                .phone(a.getPhone())
                .line1(a.getLine1())
                .line2(a.getLine2())
                .subdistrict(a.getSubdistrict())
                .district(a.getDistrict())
                .province(a.getProvince())
                .postalCode(a.getPostalCode())
                .country(a.getCountry())
                .isDefault(a.getIsDefault())
                .build();
    }
}
