package com.ecommerce.EcommerceApplication.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {
    
    @Value("${app.api.base-url}")
    private String apiBaseUrl;
    
    @Value("${app.frontend.url}")
    private String frontendUrl;
    
    @Value("${app.cors.allowed-origins}")
    private String corsAllowedOrigins;
    
    public String getApiBaseUrl() {
        return apiBaseUrl;
    }
    
    public String getFrontendUrl() {
        return frontendUrl;
    }
    
    public String getCorsAllowedOrigins() {
        return corsAllowedOrigins;
    }
    
    public String[] getCorsAllowedOriginsArray() {
        return corsAllowedOrigins.split(",");
    }
    
    // Helper method to build full URL for uploaded files
    public String buildFileUrl(String relativePath) {
        if (relativePath == null || relativePath.isEmpty()) {
            return null;
        }
        
        // If already a full URL, return as is
        if (relativePath.startsWith("http://") || relativePath.startsWith("https://")) {
            return relativePath;
        }
        
        // Remove leading slash if present
        String path = relativePath.startsWith("/") ? relativePath.substring(1) : relativePath;
        
        // Build full URL with /api prefix
        return apiBaseUrl + "/api/" + path;
    }
}
