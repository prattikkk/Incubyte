package com.example.sweet_shop.dto.auth;

import java.time.Instant;
import java.util.Set;

public record AuthResponse(String token, String username, Set<String> roles, Instant issuedAt, Instant expiresAt) {}
