package com.ecommerce.EcommerceApplication.service;

import com.ecommerce.EcommerceApplication.dto.LoginResponse;
import com.ecommerce.EcommerceApplication.entity.RefreshToken;
import com.ecommerce.EcommerceApplication.model.User;
import com.ecommerce.EcommerceApplication.repository.RefreshTokenRepository;
import com.ecommerce.EcommerceApplication.repository.UserRepository;
import com.ecommerce.EcommerceApplication.security.JwtTokenProvider;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepo;
    private final RefreshTokenRepository rtRepo;
    private final JwtTokenProvider jwt;
    private final PasswordEncoder passwordEncoder;

    private String randomToken() {
        byte[] b = new byte[48];
        new SecureRandom().nextBytes(b);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(b);
    }

    private RefreshToken issueRefresh(User u) {
        RefreshToken rt = RefreshToken.builder()
                .user(u)
                .token(randomToken())
                .expiresAt(OffsetDateTime.now().plusDays(14))
                .revoked(false)
                .build();
        return rtRepo.save(rt);
    }

    @Transactional
    public LoginResponse login(String email, String rawPassword) {
        User u = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "invalid credentials"));

        if (!passwordEncoder.matches(rawPassword, u.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "invalid credentials");
        }

        // Check if user is banned
        if (u.getIsBanned() != null && u.getIsBanned()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Your account has been banned");
        }

        String access = jwt.createToken(u.getId(), u.getUsername(), java.util.List.of(String.valueOf(u.getRole())));
        RefreshToken rt = issueRefresh(u);

        return LoginResponse.builder()
                .accessToken(access)
                .refreshToken(rt.getToken())
                .role(u.getRole())
                .build();
    }

    @Transactional
    public LoginResponse refresh(String refreshToken) {
        RefreshToken rt = rtRepo.findByToken(refreshToken)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid refresh"));

        if (rt.isRevoked() || rt.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "refresh expired/revoked");
        }

        rt.setRevoked(true);
        User u = rt.getUser();

        // Check if user is banned
        if (u.getIsBanned() != null && u.getIsBanned()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Your account has been banned");
        }

        RefreshToken newRt = issueRefresh(u);
        String newAccess = jwt.createToken(u.getId(), u.getUsername(), java.util.List.of(String.valueOf(u.getRole())));

        return LoginResponse.builder()
                .accessToken(newAccess)
                .refreshToken(newRt.getToken())
                .role(u.getRole())
                .build();
    }
}
