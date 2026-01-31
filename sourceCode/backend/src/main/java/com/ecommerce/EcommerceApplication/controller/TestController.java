package com.ecommerce.EcommerceApplication.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/test")
public class TestController {
    @GetMapping("/me")
    public Map<String, Object> me(Authentication auth) {
        var roles = auth.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList();
        return Map.of("name", auth.getName(), "roles", roles);
    }
}
