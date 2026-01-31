package com.ecommerce.EcommerceApplication.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Base64;
import java.util.Date;
import java.util.List;

@Component
public class JwtTokenProvider {

    @Value("${app.jwt.secret:dev-secret}")
    private String secret;

    @Value("${app.jwt.expiration-ms:86400000}") 
    private long expirationMs;

    private Key signingKey;

    @PostConstruct
    void init() {
        byte[] keyBytes;

        if (secret.startsWith("base64:")) {
            keyBytes = Base64.getDecoder().decode(secret.substring("base64:".length()));
        } else {
            keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        }

        if (keyBytes.length < 32) {
            throw new IllegalStateException("app.jwt.secret ต้องยาวอย่างน้อย 32 ไบต์ (>=256 บิต) สำหรับ HS256");
        }
        signingKey = Keys.hmacShaKeyFor(keyBytes);
    }

    public String createToken(Long userId, String username, List<String> roles) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .setSubject(username)                  
                .claim("uid", userId)                 
                .claim("roles", roles)                
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }


    public String issueAccessToken(Long userId, String role) {
        return createToken(userId, String.valueOf(userId), List.of(role));
    }

    public String issueAccessToken(Long userId, String role, String username) {
        return createToken(userId, username, List.of(role));
    }


    public boolean validateToken(String token) {
        try {
            getAllClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public Long getUserId(String token) {
        return getAllClaims(token).get("uid", Number.class).longValue();
    }

    public String getUsername(String token) {
        return getAllClaims(token).getSubject();
    }

    @SuppressWarnings("unchecked")
    public List<String> getRoles(String token) {
        return (List<String>) getAllClaims(token).get("roles");
    }

    private Claims getAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
