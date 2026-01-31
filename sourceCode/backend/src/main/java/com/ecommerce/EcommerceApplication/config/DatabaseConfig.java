package com.ecommerce.EcommerceApplication.config;

import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.sql.DataSource;

@Configuration
@Profile("prod")
public class DatabaseConfig {
    
    private static final Logger logger = LoggerFactory.getLogger(DatabaseConfig.class);

    @Bean
    public DataSource dataSource() {
        String url = System.getenv("SPRING_DATASOURCE_URL");
        String username = System.getenv("SPRING_DATASOURCE_USERNAME");
        String password = System.getenv("SPRING_DATASOURCE_PASSWORD");
        
        // Log for debugging (masking password)
        logger.info("=== Database Configuration Debug ===");
        logger.info("Database URL: {}", url);
        logger.info("Database Username: {}", username);
        logger.info("Password exists: {}", password != null && !password.isEmpty());
        
        if (url == null || url.isEmpty()) {
            logger.error("SPRING_DATASOURCE_URL is not set!");
            throw new RuntimeException("Database URL is not configured");
        }
        
        // Clean up URL - remove any quotes or newlines
        url = url.trim()
            .replace("\"", "")
            .replace("\\n", "")
            .replace("\n", "")
            .replace("\r", "");
            
        // Log cleaned URL
        logger.info("Cleaned Database URL: {}", url);
        
        // Check if it's external URL and might need different SSL settings
        if (url.contains("-pg.render.com")) {
            logger.info("Detected Render external database URL");
            
            // Try different SSL modes if the basic one fails
            if (!url.contains("sslmode=")) {
                url += "?sslmode=require";
                logger.info("Added sslmode=require to URL");
            }
        }
        
        try {
            DataSource ds = DataSourceBuilder.create()
                    .url(url)
                    .username(username)
                    .password(password)
                    .driverClassName("org.postgresql.Driver")
                    .build();
                    
            logger.info("DataSource created successfully");
            return ds;
        } catch (Exception e) {
            logger.error("Failed to create DataSource: ", e);
            throw e;
        }
    }
}
