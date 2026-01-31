package com.ecommerce.EcommerceApplication.controller;

import com.ecommerce.EcommerceApplication.dto.*;
import com.ecommerce.EcommerceApplication.service.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public List<AddressResponse> list(@AuthenticationPrincipal Long userId) {
        return addressService.list(userId);
    }

    @PostMapping
    public ResponseEntity<?> create(@AuthenticationPrincipal Long userId,
                                    @RequestBody CreateAddressRequest req) {
        var res = addressService.create(userId, req);
        return ResponseEntity.ok(Map.of("id", res.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@AuthenticationPrincipal Long userId,
                                    @PathVariable Long id,
                                    @RequestBody UpdateAddressRequest req) {
        addressService.update(userId, id, req);
        return ResponseEntity.ok(Map.of("message", "updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@AuthenticationPrincipal Long userId,
                                    @PathVariable Long id) {
        addressService.delete(userId, id);
        return ResponseEntity.ok(Map.of("message", "deleted"));
    }
}
