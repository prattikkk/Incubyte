package com.example.sweet_shop.dto.sweet;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record UpdateSweetRequest(
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Size(max = 50) String category,
        @NotNull @DecimalMin(value = "0.00") BigDecimal price,
        @NotNull @Min(0) Integer quantity
) {}
