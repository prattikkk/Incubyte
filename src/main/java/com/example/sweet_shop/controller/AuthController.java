package com.example.sweet_shop.controller;

import com.example.sweet_shop.dto.UserRegistrationRequest;
import com.example.sweet_shop.dto.UserResponse;
import com.example.sweet_shop.dto.auth.AuthResponse;
import com.example.sweet_shop.dto.auth.LoginRequest;
import com.example.sweet_shop.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody @Valid UserRegistrationRequest request) {
        var resp = authService.register(request);
        return ResponseEntity.status(201).body(resp);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody @Valid LoginRequest request) {
        var resp = authService.login(request);
        return ResponseEntity.ok(resp);
    }
}
