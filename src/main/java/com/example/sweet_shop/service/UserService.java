package com.example.sweet_shop.service;

import com.example.sweet_shop.domain.RoleName;
import com.example.sweet_shop.domain.User;
import com.example.sweet_shop.dto.UserRegistrationRequest;
import com.example.sweet_shop.dto.UserResponse;
import com.example.sweet_shop.repository.RoleRepository;
import com.example.sweet_shop.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponse register(UserRegistrationRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("username already exists");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("email already exists");
        }

        var roleUser = roleRepository.findByName(RoleName.ROLE_USER)
                .orElseThrow(() -> new IllegalStateException("ROLE_USER not initialized"));

        var user = User.builder()
                .username(request.username())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .build();
        user.getRoles().add(roleUser);

        var saved = userRepository.save(user);
        return toResponse(saved);
    }

    private UserResponse toResponse(User user) {
        Set<String> roles = user.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toSet());
        return new UserResponse(user.getId(), user.getUsername(), user.getEmail(), roles, user.getCreatedAt());
    }
}
