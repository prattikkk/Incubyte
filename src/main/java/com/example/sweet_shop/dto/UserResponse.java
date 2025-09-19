package com.example.sweet_shop.dto;

import java.time.Instant;
import java.util.Set;

public record UserResponse(Long id, String username, String email, Set<String> roles, Instant createdAt) {}
