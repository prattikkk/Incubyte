package com.example.sweet_shop.service.sweet;

import com.example.sweet_shop.dto.sweet.CreateSweetRequest;
import com.example.sweet_shop.dto.sweet.SweetSearchCriteria;
import com.example.sweet_shop.repository.SweetRepository;
import com.example.sweet_shop.service.SweetService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.*;

@DataJpaTest
@Import(SweetService.class)
class SweetServiceTest {

    @Autowired
    SweetService sweetService;

    @Autowired
    SweetRepository sweetRepository;

    @BeforeEach
    void clear() { sweetRepository.deleteAll(); }

    @Test
    @DisplayName("create should persist sweet and return response")
    void create_success() {
        var resp = sweetService.create(new CreateSweetRequest("Ladoo","Indian", new BigDecimal("10.50"), 25));
        assertThat(resp.id()).isNotNull();
        assertThat(resp.name()).isEqualTo("Ladoo");
        assertThat(resp.quantity()).isEqualTo(25);
    }

    @Test
    @DisplayName("create should reject duplicate name")
    void create_duplicate() {
        sweetService.create(new CreateSweetRequest("Barfi","Indian", new BigDecimal("15.00"), 10));
        assertThatThrownBy(() -> sweetService.create(new CreateSweetRequest("Barfi","Other", new BigDecimal("12.00"), 5)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("name");
    }

    @Test
    @DisplayName("purchase should decrement quantity and not go negative")
    void purchase_success() {
        var s = sweetService.create(new CreateSweetRequest("Candy","General", new BigDecimal("2.00"), 3));
        var after = sweetService.purchase(s.id(),2);
        assertThat(after.quantity()).isEqualTo(1);
    }

    @Test
    @DisplayName("purchase should fail when insufficient stock")
    void purchase_insufficient() {
        var s = sweetService.create(new CreateSweetRequest("Cookie","Bakery", new BigDecimal("5.00"), 1));
        assertThatThrownBy(() -> sweetService.purchase(s.id(),2))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("stock");
    }

    @Test
    @DisplayName("restock should increase quantity")
    void restock_success() {
        var s = sweetService.create(new CreateSweetRequest("Cake","Bakery", new BigDecimal("20.00"), 5));
        var after = sweetService.restock(s.id(),7);
        assertThat(after.quantity()).isEqualTo(12);
    }

    @Test
    @DisplayName("search should filter by name substring and category and price range")
    void search_filters() {
        sweetService.create(new CreateSweetRequest("Chocolate Bar","Choco", new BigDecimal("3.00"), 50));
        sweetService.create(new CreateSweetRequest("Dark Chocolate","Choco", new BigDecimal("4.50"), 40));
        sweetService.create(new CreateSweetRequest("Vanilla Fudge","Fudge", new BigDecimal("6.00"), 20));

        var criteria = new SweetSearchCriteria("choco","Choco", new BigDecimal("3.50"), new BigDecimal("5.00"));
        var list = sweetService.search(criteria);
        assertThat(list).hasSize(1);
        assertThat(list.getFirst().name()).isEqualTo("Dark Chocolate");
    }
}
