package com.example.sweet_shop.dto.sweet;

import java.math.BigDecimal;
import java.time.Instant;

public record SweetResponse(Long id, String name, String category, BigDecimal price, Integer quantity, Instant createdAt, Instant updatedAt) {}
