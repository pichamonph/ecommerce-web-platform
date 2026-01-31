package com.ecommerce.EcommerceApplication.security;

import com.ecommerce.EcommerceApplication.model.User;
import com.ecommerce.EcommerceApplication.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtTokenProvider tokenProvider, UserRepository userRepository) {
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
    }
    
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String p = request.getServletPath();
        return p.startsWith("/auth/")
            || p.startsWith("/dev/")
            || "/health".equals(p)
            || "/error".equals(p);
}

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        String prefix = "Bearer ";

        if (header == null || !header.startsWith(prefix)) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(prefix.length());
        if (token == null || token.isBlank()) { 
            filterChain.doFilter(request, response);
            return;
        }

        try {
            if (tokenProvider.validateToken(token)) {
                Long userId = tokenProvider.getUserId(token);
                String username = tokenProvider.getUsername(token);
                List<String> roles = tokenProvider.getRoles(token);

                // Check if user is banned
                User user = userRepository.findById(userId).orElse(null);
                if (user != null && user.getIsBanned() != null && user.getIsBanned()) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Your account has been banned\"}");
                    return;
                }

                var authorities = roles.stream()
                        .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r)
                        .map(SimpleGrantedAuthority::new)
                        .toList();

                System.out.println("DEBUG JWT: userId=" + userId + ", username=" + username + ", roles=" + roles);

                // Set userId as principal (instead of username) so @AuthenticationPrincipal Long userId works
                var authentication =
                        new UsernamePasswordAuthenticationToken(userId, null, authorities);
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            System.err.println("DEBUG JWT ERROR: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
