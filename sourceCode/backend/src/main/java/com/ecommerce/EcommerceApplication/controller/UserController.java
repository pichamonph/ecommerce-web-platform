package com.ecommerce.EcommerceApplication.controller;

import com.ecommerce.EcommerceApplication.config.AppConfig;
import com.ecommerce.EcommerceApplication.dto.ChangePasswordRequest;
import com.ecommerce.EcommerceApplication.dto.UpdateMeRequest;
import com.ecommerce.EcommerceApplication.model.User;
import com.ecommerce.EcommerceApplication.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {

    private final UserService userService;
    private final AppConfig appConfig;

    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal Long userId) {
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        User u = userService.getMe(userId);
        
        // Format profile image URL to full URL
        String profileImageUrl = "";
        if (u.getProfileImage() != null && !u.getProfileImage().isEmpty()) {
            profileImageUrl = appConfig.buildFileUrl(u.getProfileImage());
        }
        
        return ResponseEntity.ok(Map.of(
                "id", u.getId(),
                "username", u.getUsername(),
                "email", u.getEmail() != null ? u.getEmail() : "",
                "role", u.getRole(),
                "firstName", u.getFirstName() != null ? u.getFirstName() : "",
                "lastName", u.getLastName() != null ? u.getLastName() : "",
                "phone", u.getPhone() != null ? u.getPhone() : "",
                "profileImage", profileImageUrl
        ));
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMe(@AuthenticationPrincipal Long userId,
                                      @RequestBody UpdateMeRequest req) {
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        var u = userService.updateUsername(userId, req);
        
        // Format profile image URL to full URL
        String profileImageUrl = "";
        if (u.getProfileImage() != null && !u.getProfileImage().isEmpty()) {
            profileImageUrl = appConfig.buildFileUrl(u.getProfileImage());
        }
        
        return ResponseEntity.ok(Map.of(
                "id", u.getId(),
                "username", u.getUsername(),
                "email", u.getEmail() != null ? u.getEmail() : "",
                "role", u.getRole(),
                "firstName", u.getFirstName() != null ? u.getFirstName() : "",
                "lastName", u.getLastName() != null ? u.getLastName() : "",
                "phone", u.getPhone() != null ? u.getPhone() : "",
                "profileImage", profileImageUrl
        ));
    }

    @PutMapping("/me/password")
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal Long userId,
                                            @RequestBody ChangePasswordRequest req) {
        userService.changePassword(userId, req);
        return ResponseEntity.ok(Map.of("message", "password changed"));
    }
}
