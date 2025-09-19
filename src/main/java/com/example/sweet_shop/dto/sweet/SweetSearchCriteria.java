package com.example.sweet_shop.dto.sweet;

import java.math.BigDecimal;

public record SweetSearchCriteria(String name, String category, BigDecimal minPrice, BigDecimal maxPrice) {}
