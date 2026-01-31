package com.ecommerce.EcommerceApplication.config;

import com.ecommerce.EcommerceApplication.security.JwtChannelInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Autowired
    private JwtChannelInterceptor jwtChannelInterceptor;

    public WebSocketConfig() {
        System.out.println("🏗️ WebSocketConfig class created!");
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        System.out.println("📢 Configuring Message Broker...");
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
        System.out.println("✅ Message Broker configured: /topic, /app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        System.out.println("🌐 Registering STOMP endpoints...");

        registry.addEndpoint("/ws-chat")
                .setAllowedOriginPatterns("*")
                .withSockJS();

        System.out.println("✅ STOMP endpoint registered: /ws-chat");
        System.out.println("📍 SockJS info endpoint: http://localhost:8080/ws-chat/info");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(jwtChannelInterceptor);
        System.out.println("✅ JWT Channel Interceptor registered");
    }
}
