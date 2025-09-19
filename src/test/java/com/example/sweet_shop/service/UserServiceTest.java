package com.example.sweet_shop.service;

import com.example.sweet_shop.domain.Role;
import com.example.sweet_shop.domain.RoleName;
import com.example.sweet_shop.dto.UserRegistrationRequest;
import com.example.sweet_shop.repository.RoleRepository;
import com.example.sweet_shop.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Import;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.*;

@DataJpaTest
@Import({UserService.class, UserServiceTest.TestConfig.class})
class UserServiceTest {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @BeforeEach
    void setupRoles() {
        if (roleRepository.findByName(RoleName.ROLE_USER).isEmpty()) {
            roleRepository.save(Role.builder().name(RoleName.ROLE_USER).build());
        }
    }
    @TestConfiguration
    static class TestConfig {
        @org.springframework.context.annotation.Bean
        PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
    }
    

    @Test
    @DisplayName("register should hash password, assign ROLE_USER, and persist user")
    void register_success() {
        var req = new UserRegistrationRequest("alice","alice@example.com","Password1");
        var resp = userService.register(req);

        assertThat(resp.id()).isNotNull();
        var stored = userRepository.findById(resp.id()).orElseThrow();
        assertThat(stored.getPasswordHash()).isNotEqualTo("Password1");
        assertThat(stored.getRoles()).extracting(r -> r.getName()).contains(RoleName.ROLE_USER);
    }

    @Test
    @DisplayName("register should reject duplicate username")
    void register_duplicateUsername() {
        var req = new UserRegistrationRequest("bob","bob@example.com","Password1");
        userService.register(req);

        var dup = new UserRegistrationRequest("bob","bob2@example.com","Password1");
        assertThatThrownBy(() -> userService.register(dup))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("username");
    }
}
