package com.ecommerce.EcommerceApplication.security;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class JwtChannelInterceptor implements ChannelInterceptor {

    private final JwtTokenProvider tokenProvider;

    public JwtChannelInterceptor(JwtTokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            // ดึง JWT token จาก header (client จะส่งมาใน Authorization header)
            List<String> authHeaders = accessor.getNativeHeader("Authorization");

            if (authHeaders != null && !authHeaders.isEmpty()) {
                String authHeader = authHeaders.get(0);
                String prefix = "Bearer ";

                if (authHeader != null && authHeader.startsWith(prefix)) {
                    String token = authHeader.substring(prefix.length());

                    try {
                        if (tokenProvider.validateToken(token)) {
                            Long userId = tokenProvider.getUserId(token);
                            List<String> roles = tokenProvider.getRoles(token);

                            var authorities = roles.stream()
                                    .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r)
                                    .map(SimpleGrantedAuthority::new)
                                    .toList();

                            var authentication = new UsernamePasswordAuthenticationToken(
                                    userId, null, authorities);

                            // ใส่ authentication ลงใน WebSocket session
                            accessor.setUser(authentication);

                            System.out.println("✅ WebSocket authenticated for userId: " + userId);
                        }
                    } catch (Exception e) {
                        System.err.println("❌ WebSocket JWT validation failed: " + e.getMessage());
                    }
                }
            }
        }

        return message;
    }
}
