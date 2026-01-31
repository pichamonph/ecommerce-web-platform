package com.ecommerce.EcommerceApplication.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ws-status")
public class WebSocketStatusController {

    @GetMapping
    public Map<String, Object> getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("message", "WebSocket status endpoint working");
        status.put("expectedSockjsEndpoint", "http://localhost:8080/ws-chat/info");
        status.put("timestamp", System.currentTimeMillis());

        // Try to access SockJS endpoint programmatically
        try {
            java.net.URL url = new java.net.URL("http://localhost:8080/ws-chat/info");
            java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            int responseCode = conn.getResponseCode();
            status.put("sockjsEndpointTest", responseCode == 200 ? "working" : "failed_" + responseCode);
        } catch (Exception e) {
            status.put("sockjsEndpointTest", "error: " + e.getMessage());
        }

        return status;
    }
}