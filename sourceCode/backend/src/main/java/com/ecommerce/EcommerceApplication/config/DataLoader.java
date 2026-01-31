package com.ecommerce.EcommerceApplication.config;

import com.ecommerce.EcommerceApplication.model.User;
import com.ecommerce.EcommerceApplication.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Create admin user if not exists
        if (userRepository.findByEmail("admin@ecommerce.com").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@ecommerce.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole("ROLE_ADMIN");
            admin.setFirstName("Admin");
            admin.setLastName("System");
            admin.setPhone("0800000000");

            userRepository.save(admin);
            log.info("✓ Admin user created: admin@ecommerce.com / admin123");
        } else {
            log.info("✓ Admin user already exists");
        }
    }
}
