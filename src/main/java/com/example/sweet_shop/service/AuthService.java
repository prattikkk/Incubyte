package com.example.sweet_shop.service;

import com.example.sweet_shop.domain.User;
import com.example.sweet_shop.error.NotFoundException;
import com.example.sweet_shop.dto.UserRegistrationRequest;
import com.example.sweet_shop.dto.UserResponse;
import com.example.sweet_shop.dto.auth.AuthResponse;
import com.example.sweet_shop.dto.auth.LoginRequest;
import com.example.sweet_shop.repository.UserRepository;
import com.example.sweet_shop.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserService userService, UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider jwtTokenProvider) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public UserResponse register(UserRegistrationRequest request) {
        return userService.register(request);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new NotFoundException("invalid credentials"));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new NotFoundException("invalid credentials");
        }
        var roles = user.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toList());
        var token = jwtTokenProvider.generateToken(user.getUsername(), roles);
        var issuedAt = Instant.now();
        var expiresAt = issuedAt.plus(jwtTokenProvider.getExpirationMinutes(), ChronoUnit.MINUTES);
        return new AuthResponse(token, user.getUsername(), user.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toSet()), issuedAt, expiresAt);
    }
}
