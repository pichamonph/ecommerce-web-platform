package com.ecommerce.EcommerceApplication.controller;

import com.ecommerce.EcommerceApplication.dto.ChangePasswordRequest;
import com.ecommerce.EcommerceApplication.dto.UpdateMeRequest;
import com.ecommerce.EcommerceApplication.dto.UserProfileResponse;
import com.ecommerce.EcommerceApplication.model.User;
import com.ecommerce.EcommerceApplication.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/me")
@RequiredArgsConstructor
public class MeController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private User meOrThrow(String username) {
        return userRepository.findByUsername(username).orElseThrow();
    }

    @GetMapping
    public ResponseEntity<UserProfileResponse> me(@AuthenticationPrincipal String username) {
        System.out.println("DEBUG: username from @AuthenticationPrincipal = " + username);
        User u = meOrThrow(username);
        return ResponseEntity.ok(new UserProfileResponse(u.getId(), u.getUsername(), u.getEmail(), u.getRole()));
    }

    @PutMapping
    public ResponseEntity<?> updateMe(@AuthenticationPrincipal String username,
                                      @RequestBody UpdateMeRequest req) {
        User u = meOrThrow(username);

        if (req.getUsername() != null && !req.getUsername().isBlank()
                && !req.getUsername().equals(u.getUsername())) {
            if (userRepository.existsByUsername(req.getUsername())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
            }
            u.setUsername(req.getUsername());
        }

        if (req.getEmail() != null && !req.getEmail().isBlank()
                && !req.getEmail().equalsIgnoreCase(u.getEmail())) {
            if (userRepository.existsByEmail(req.getEmail())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
            }
            u.setEmail(req.getEmail());
        }

        userRepository.save(u);
        return ResponseEntity.ok(Map.of("message", "updated"));
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal String username,
                                            @RequestBody ChangePasswordRequest req) {
        User u = meOrThrow(username);
        if (!passwordEncoder.matches(req.getOldPassword(), u.getPassword())) {
            return ResponseEntity.status(400).body(Map.of("error", "oldPassword incorrect"));
        }
        u.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(u);
        return ResponseEntity.ok(Map.of("message", "password changed"));
    }
}
