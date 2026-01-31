package com.ecommerce.EcommerceApplication.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OmiseConfig {

    @Value("${omise.public-key:pk_test_5xxxxxxxxxxxxxxxxxxx}")
    private String publicKey;

    @Value("${omise.secret-key:sk_test_5xxxxxxxxxxxxxxxxxxx}")
    private String secretKey;

    @Value("${omise.api-version:2019-05-29}")
    private String apiVersion;

    @Value("${omise.api-url:https://api.omise.co}")
    private String apiUrl;

    public String getPublicKey() {
        return publicKey;
    }

    public String getSecretKey() {
        return secretKey;
    }

    public String getApiVersion() {
        return apiVersion;
    }

    public String getApiUrl() {
        return apiUrl;
    }
}