package com.ecommerce.EcommerceApplication.controller;

import com.ecommerce.EcommerceApplication.model.User;
import com.ecommerce.EcommerceApplication.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/dev")
@RequiredArgsConstructor
public class DevController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/ping")
    public ResponseEntity<?> ping() {
        return ResponseEntity.ok(Map.of("status", "ok", "message", "DevController is working!"));
    }

    @GetMapping("/check-admin")
    public ResponseEntity<?> checkAdmin() {
        return userRepository.findByEmail("admin@ecommerce.com")
                .map(user -> ResponseEntity.ok(Map.of(
                        "exists", true,
                        "username", user.getUsername(),
                        "email", user.getEmail(),
                        "role", user.getRole(),
                        "firstName", user.getFirstName() != null ? user.getFirstName() : "null",
                        "lastName", user.getLastName() != null ? user.getLastName() : "null"
                )))
                .orElse(ResponseEntity.ok(Map.of("exists", false)));
    }

    @PostMapping("/fix-admin")
    public ResponseEntity<?> fixAdmin() {
        User admin = userRepository.findByEmail("admin@ecommerce.com")
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        admin.setRole("ROLE_ADMIN");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setFirstName("Admin");
        admin.setLastName("System");
        admin.setPhone("0800000000");

        userRepository.save(admin);

        return ResponseEntity.ok(Map.of(
                "message", "Admin user fixed successfully",
                "email", "admin@ecommerce.com",
                "password", "admin123",
                "role", "ROLE_ADMIN"
        ));
    }

    @PostMapping("/fix-admin-by-username")
    public ResponseEntity<?> fixAdminByUsername() {
        User admin = userRepository.findByUsername("admin")
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        admin.setRole("ROLE_ADMIN");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setEmail("admin@ecommerce.com");
        admin.setFirstName("Admin");
        admin.setLastName("System");
        admin.setPhone("0800000000");

        userRepository.save(admin);

        return ResponseEntity.ok(Map.of(
                "message", "Admin user fixed successfully",
                "username", "admin",
                "email", "admin@ecommerce.com",
                "password", "admin123",
                "role", "ROLE_ADMIN"
        ));
    }

    @PostMapping("/fix-seller-roles")
    public ResponseEntity<?> fixSellerRoles() {
        var allUsers = userRepository.findAll();
        int fixed = 0;

        for (User user : allUsers) {
            if ("SELLER".equals(user.getRole())) {
                user.setRole("ROLE_SELLER");
                userRepository.save(user);
                fixed++;
            }
        }

        return ResponseEntity.ok(Map.of(
                "message", "Seller roles fixed successfully",
                "fixedCount", fixed,
                "note", "All SELLER roles changed to ROLE_SELLER"
        ));
    }

    @GetMapping("/check-user-role/{email}")
    public ResponseEntity<?> checkUserRole(@PathVariable String email) {
        return userRepository.findByEmail(email)
                .map(user -> ResponseEntity.ok(Map.of(
                        "exists", true,
                        "username", user.getUsername(),
                        "email", user.getEmail(),
                        "role", user.getRole()
                )))
                .orElse(ResponseEntity.ok(Map.of("exists", false)));
    }
}
