package com.ecommerce.EcommerceApplication.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/debug")
@CrossOrigin(origins = "http://localhost:3000")
public class WebSocketDebugController {

    @GetMapping("/websocket-status")
    public Map<String, Object> getWebSocketStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("websocketEndpoint", "ws://localhost:8080/ws-chat");
        status.put("sockjsEndpoint", "http://localhost:8080/ws-chat");
        status.put("topicPrefix", "/topic");
        status.put("appPrefix", "/app");
        status.put("cors", "enabled");
        status.put("timestamp", System.currentTimeMillis());

        return status;
    }
}