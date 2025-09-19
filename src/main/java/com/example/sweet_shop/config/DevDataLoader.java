package com.example.sweet_shop.config;

import com.example.sweet_shop.domain.Role;
import com.example.sweet_shop.domain.RoleName;
import com.example.sweet_shop.domain.User;
import com.example.sweet_shop.repository.RoleRepository;
import com.example.sweet_shop.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Profile("dev")
public class DevDataLoader {

    @Bean
    CommandLineRunner seedAdmin(UserRepository users, RoleRepository roles, PasswordEncoder encoder) {
        return args -> {
            if (users.findByUsername("admin").isEmpty()) {
                Role roleUser = roles.findByName(RoleName.ROLE_USER).orElseThrow();
                Role roleAdmin = roles.findByName(RoleName.ROLE_ADMIN).orElseThrow();
                User admin = User.builder()
                        .username("admin")
                        .email("admin@example.com")
                        .passwordHash(encoder.encode("admin123"))
                        .build();
                admin.getRoles().add(roleUser);
                admin.getRoles().add(roleAdmin);
                users.save(admin);
            }
        };
    }
}
