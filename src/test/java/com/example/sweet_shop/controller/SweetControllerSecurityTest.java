package com.example.sweet_shop.controller;

import com.example.sweet_shop.dto.UserRegistrationRequest;
import com.example.sweet_shop.dto.auth.LoginRequest;
import com.example.sweet_shop.repository.RoleRepository;
import com.example.sweet_shop.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;


import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Transactional
class SweetControllerSecurityTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    private String userToken;
    private String adminToken;

    @BeforeEach
    void setup() throws Exception {
        // register normal user
        register("user1","user1@example.com","Password1!");
        userToken = login("user1","Password1!");
        // register admin user then elevate by directly assigning role if necessary (simpler path: assume ROLE_ADMIN inserted by migration and manually update)
        register("admin","admin@example.com","Password1!");
        // direct DB update to grant admin role if not already
        var admin = userRepository.findByUsername("admin").orElseThrow();
        var adminRole = roleRepository.findByName(com.example.sweet_shop.domain.RoleName.ROLE_ADMIN).orElseThrow();
        admin.getRoles().add(adminRole);
        userRepository.save(admin);
        adminToken = login("admin","Password1!");
    }

    private void register(String username, String email, String password) throws Exception {
        var req = new UserRegistrationRequest(username,email,password);
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());
    }

    private String login(String username, String password) throws Exception {
        var req = new LoginRequest(username,password);
        var mvcResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andReturn();
        var json = mvcResult.getResponse().getContentAsString();
        return objectMapper.readTree(json).get("token").asText();
    }

    @Test
    @DisplayName("Public list sweets without auth")
    void publicList() throws Exception {
        mockMvc.perform(get("/api/sweets"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Create sweet requires auth")
    void createRequiresAuth() throws Exception {
        var payload = "{\"name\":\"Test Sweet\",\"category\":\"Test\",\"price\":5.25,\"quantity\":10}";
        mockMvc.perform(post("/api/sweets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/sweets")
                        .header("Authorization","Bearer "+userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists());
    }

    @Test
    @DisplayName("Non-admin cannot restock or delete")
    void nonAdminForbidden() throws Exception {
        var payload = "{\"name\":\"Choco\",\"category\":\"Cat\",\"price\":2.00,\"quantity\":5}";
        var createId = objectMapper.readTree(mockMvc.perform(post("/api/sweets")
                        .header("Authorization","Bearer "+userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(post("/api/sweets/"+createId+"/restock?quantity=5")
                        .header("Authorization","Bearer "+userToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/sweets/"+createId)
                        .header("Authorization","Bearer "+userToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Admin can restock and delete")
    void adminCanManageStock() throws Exception {
        var payload = "{\"name\":\"Mint\",\"category\":\"Herb\",\"price\":1.50,\"quantity\":3}";
        var id = objectMapper.readTree(mockMvc.perform(post("/api/sweets")
                        .header("Authorization","Bearer "+adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(post("/api/sweets/"+id+"/restock?quantity=4")
                        .header("Authorization","Bearer "+adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity").value(7));

        mockMvc.perform(delete("/api/sweets/"+id)
                        .header("Authorization","Bearer "+adminToken))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/sweets/"+id)
                        .header("Authorization","Bearer "+adminToken))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Purchase reduces quantity and validates stock")
    void purchaseFlow() throws Exception {
        var payload = "{\"name\":\"Bar\",\"category\":\"Snack\",\"price\":3.00,\"quantity\":5}";
        var id = objectMapper.readTree(mockMvc.perform(post("/api/sweets")
                        .header("Authorization","Bearer "+userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(post("/api/sweets/"+id+"/purchase?quantity=2")
                        .header("Authorization","Bearer "+userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity").value(3));

        mockMvc.perform(post("/api/sweets/"+id+"/purchase?quantity=10")
                        .header("Authorization","Bearer "+userToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("illegal_argument"));
    }

    @Test
    @DisplayName("Validation error returns structured response")
    void validationErrors() throws Exception {
        var badPayload = "{\"name\":\"\",\"category\":\"\",\"price\":-1,\"quantity\":0}";
        mockMvc.perform(post("/api/sweets")
                        .header("Authorization","Bearer "+userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(badPayload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("validation_failed"));
    }
}
