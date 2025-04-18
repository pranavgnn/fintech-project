package com.fintech.config;

import com.fintech.entity.Role;
import com.fintech.entity.RoleType;
import com.fintech.entity.User;
import com.fintech.repository.RoleRepository;
import com.fintech.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Create admin role if it doesn't exist
        Role adminRole = roleRepository.findByName(RoleType.ROLE_ADMIN)
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName(RoleType.ROLE_ADMIN);
                    return roleRepository.save(role);
                });

        // Check if any user with admin role exists
        List<User> allUsers = userRepository.findAll();
        boolean adminExists = allUsers.stream()
                .anyMatch(user -> user.getRoles().contains(adminRole));

        if (!adminExists) {
            log.info("No admin user found. Creating admin user...");

            // Generate a unique phone number to avoid conflicts
            String adminPhoneNumber = "+" + System.currentTimeMillis();

            User admin = new User();
            admin.setName("Admin");
            admin.setEmail("admin@example.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setPhoneNumber(adminPhoneNumber);
            admin.getRoles().add(adminRole);

            try {
                userRepository.save(admin);
                log.info("Admin user created successfully with phone number: {}", adminPhoneNumber);
            } catch (Exception e) {
                log.error("Failed to create admin user: {}", e.getMessage());
            }
        } else {
            log.info("Admin user already exists");
        }
    }
}