package com.example.sweet_shop.security;

import com.example.sweet_shop.config.JwtProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider provider;

    @BeforeEach
    void setup() {
        JwtProperties props = new JwtProperties();
        props.setSecret("0123456789ABCDEF0123456789ABCDEF0123456789AB");
        props.setExpirationMinutes(5);
        provider = new JwtTokenProvider(props);
    }

    @Test
    @DisplayName("generateToken should embed username and roles and be valid")
    void generateAndParse() {
        String token = provider.generateToken("alice", List.of("ROLE_USER"));
        assertThat(token).isNotBlank();
        assertThat(provider.isValid(token)).isTrue();
        assertThat(provider.extractUsername(token)).isEqualTo("alice");
        assertThat(provider.extractRoles(token)).containsExactly("ROLE_USER");
    }

    @Test
    @DisplayName("isValid should return false for tampered token")
    void invalidToken() {
        String token = provider.generateToken("bob", List.of("ROLE_USER"));
        String bad = token + "x";
        assertThat(provider.isValid(bad)).isFalse();
    }
}
