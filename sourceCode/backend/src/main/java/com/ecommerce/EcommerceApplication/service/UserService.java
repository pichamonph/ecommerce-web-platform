package com.ecommerce.EcommerceApplication.service;

import com.ecommerce.EcommerceApplication.dto.ChangePasswordRequest;
import com.ecommerce.EcommerceApplication.dto.LoginRequest;
import com.ecommerce.EcommerceApplication.dto.RegisterRequest;
import com.ecommerce.EcommerceApplication.dto.UpdateMeRequest;
import com.ecommerce.EcommerceApplication.model.User;
import com.ecommerce.EcommerceApplication.repository.UserRepository;
import com.ecommerce.EcommerceApplication.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public void register(RegisterRequest req) {
        if (userRepo.existsByUsername(req.getUsername())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "username already taken");
        }
        if (userRepo.existsByEmail(req.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "email already used");
        }

        User u = new User();
        u.setUsername(req.getUsername());
        u.setEmail(req.getEmail());
        u.setPassword(passwordEncoder.encode(req.getPassword()));
        if (u.getRole() == null) u.setRole("ROLE_USER");
        userRepo.save(u);
    }

    public String login(LoginRequest req) {
        User u = userRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "invalid credentials"));

        if (!passwordEncoder.matches(req.getPassword(), u.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "invalid credentials");
        }

        String role = String.valueOf(u.getRole());
        return tokenProvider.createToken(u.getId(), u.getUsername(), List.of(role));
    }

    public User getMe(Long userId) {
        return userRepo.findById(userId).orElseThrow();
    }

    public User updateUsername(Long userId, UpdateMeRequest req) {
        User u = userRepo.findById(userId).orElseThrow();

        // Update username if provided
        if (req.getUsername() != null && !req.getUsername().isBlank()) {
            if (!req.getUsername().equals(u.getUsername()) && userRepo.existsByUsername(req.getUsername())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "username already taken");
            }
            u.setUsername(req.getUsername());
        }

        // Update email if provided
        if (req.getEmail() != null && !req.getEmail().isBlank()) {
            if (!req.getEmail().equals(u.getEmail()) && userRepo.existsByEmail(req.getEmail())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "email already used");
            }
            u.setEmail(req.getEmail());
        }

        // Update firstName if provided
        if (req.getFirstName() != null) {
            u.setFirstName(req.getFirstName());
        }

        // Update lastName if provided
        if (req.getLastName() != null) {
            u.setLastName(req.getLastName());
        }

        // Update phone if provided
        if (req.getPhone() != null) {
            u.setPhone(req.getPhone());
        }

        // Update profileImage if provided
        if (req.getProfileImage() != null) {
            u.setProfileImage(req.getProfileImage());
        }

        return userRepo.save(u);
    }

    public void changePassword(Long userId, ChangePasswordRequest req) {
        if (req.getOldPassword() == null || req.getNewPassword() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "password is required");
        }
        User u = userRepo.findById(userId).orElseThrow();
        if (!passwordEncoder.matches(req.getOldPassword(), u.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "old password is incorrect");
        }
        u.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepo.save(u);
    }
}
