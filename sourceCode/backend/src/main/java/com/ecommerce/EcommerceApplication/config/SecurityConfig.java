package com.ecommerce.EcommerceApplication.config;

import com.ecommerce.EcommerceApplication.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // ปิด CSRF เพราะใช้ JWT และเปิด CORS
            .csrf(csrf -> csrf.disable())
            .cors(cors -> {})
            // อนุญาตให้ iframe สำหรับ H2 Console / เครื่องมือ dev
            .headers(h -> h.frameOptions(frame -> frame.disable()))
            // ใช้ JWT แบบไร้สถานะ
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // preflight
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // dev endpoints (เฉพาะ dev profile) - MUST BE FIRST
                .requestMatchers("/dev/**").permitAll()

                // public health/error
                .requestMatchers("/health", "/error").permitAll()

                // auth/sign-in/sign-up
                .requestMatchers("/auth/**").permitAll()

                // websocket endpoint (จาก Dol_Backend)
                .requestMatchers("/ws-chat", "/ws-chat/**").permitAll()

                // H2 console (เฉพาะ dev)
                .requestMatchers("/h2-console/**").permitAll()

                // public GET ตัวอย่าง
                .requestMatchers(HttpMethod.GET, "/shops/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/products/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/categories/**").permitAll()

                // payment webhook (ไม่ต้อง auth - สำหรับ payment gateway callback)
                .requestMatchers("/payments/webhook").permitAll()
                .requestMatchers("/payments/omise/webhook").permitAll()
                .requestMatchers("/payments/omise/public-key").permitAll()
                .requestMatchers("/payments/omise/payment-methods").permitAll()

                // file uploads - GET เพื่อดูรูป public, POST ต้อง auth
                .requestMatchers(HttpMethod.GET, "/files/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/files/upload/**").authenticated()

                // ตัวอย่าง role-based
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/seller/apply").authenticated()
                .requestMatchers("/seller/**").hasRole("SELLER")

                // ที่เหลือต้อง auth
                .anyRequest().authenticated()
            );

        // ใส่ JWT filter ก่อน UsernamePasswordAuthenticationFilter
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ใช้ AuthenticationManager ของ Spring
    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration cfg) throws Exception {
        return cfg.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
