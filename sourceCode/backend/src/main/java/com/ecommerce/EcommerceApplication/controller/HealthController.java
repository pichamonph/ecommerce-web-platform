package com.ecommerce.EcommerceApplication.controller;

import com.ecommerce.EcommerceApplication.repository.UserRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {

    private final UserRepository users;

    public HealthController(UserRepository users) {
        this.users = users;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> m = new HashMap<>();
        m.put("status", "ok");
        try {
            long count = users.count(); 
            m.put("db", "up");
            m.put("users", count);
        } catch (Exception e) {
            m.put("db", "down");
            m.put("error", e.getMessage());
        }
        return m;
    }
}
