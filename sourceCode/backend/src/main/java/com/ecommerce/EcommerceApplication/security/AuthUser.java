package com.ecommerce.EcommerceApplication.security;

import java.util.List;

public record AuthUser(Long id, String username, List<String> roles) {}
