package com.example.sweet_shop.dto.sweet;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class UpdateSweetRequestTest {

    @Test
    void recordAccessorsWork() {
        UpdateSweetRequest req = new UpdateSweetRequest(
                "Ladoo",
                "Indian",
                new BigDecimal("12.34"),
                5
        );

        assertEquals("Ladoo", req.name());
        assertEquals("Indian", req.category());
        assertEquals(new BigDecimal("12.34"), req.price());
        assertEquals(5, req.quantity());
    }
}
