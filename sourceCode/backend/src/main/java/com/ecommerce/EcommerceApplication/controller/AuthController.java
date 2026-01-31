package com.ecommerce.EcommerceApplication.controller;

import com.ecommerce.EcommerceApplication.dto.LoginRequest;
import com.ecommerce.EcommerceApplication.dto.LoginResponse;
import com.ecommerce.EcommerceApplication.dto.RefreshRequest;
import com.ecommerce.EcommerceApplication.dto.RegisterRequest;
import com.ecommerce.EcommerceApplication.model.User;
import com.ecommerce.EcommerceApplication.repository.UserRepository;
import com.ecommerce.EcommerceApplication.service.AuthService;
import com.ecommerce.EcommerceApplication.service.UserService;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final AuthService authService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        userService.register(request);
        return ResponseEntity.ok(Map.of("message", "registered"));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        var res = authService.login(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(res);
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(@Valid @RequestBody RefreshRequest req) {
        var res = authService.refresh(req.getRefreshToken());
        return ResponseEntity.ok(res);
    }

    @PostMapping("/create-admin")
    public ResponseEntity<?> createAdmin() {
        if (userRepository.findByEmail("admin@ecommerce.com").isPresent()) {
            return ResponseEntity.ok(Map.of("message", "Admin user already exists"));
        }

        User admin = new User();
        admin.setUsername("admin");
        admin.setEmail("admin@ecommerce.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole("ROLE_ADMIN");
        admin.setFirstName("Admin");
        admin.setLastName("System");
        admin.setPhone("0800000000");

        userRepository.save(admin);
        return ResponseEntity.ok(Map.of(
            "message", "Admin user created successfully",
            "email", "admin@ecommerce.com",
            "password", "admin123"
        ));
    }

    @GetMapping("/check-admin")
    public ResponseEntity<?> checkAdmin() {
        return userRepository.findByUsername("admin")
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
}
