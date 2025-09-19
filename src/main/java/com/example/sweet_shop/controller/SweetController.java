package com.example.sweet_shop.controller;

import com.example.sweet_shop.dto.sweet.*;
import com.example.sweet_shop.service.SweetService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/sweets")
@Validated
public class SweetController {

    private final SweetService sweetService;

    public SweetController(SweetService sweetService) {
        this.sweetService = sweetService;
    }

    // Public list (simple list w/out filters)
    @GetMapping
    public List<SweetResponse> listAll(@RequestParam(name = "name", required = false) String name,
                                       @RequestParam(name = "category", required = false) String category,
                                       @RequestParam(name = "minPrice", required = false) BigDecimal minPrice,
                                       @RequestParam(name = "maxPrice", required = false) BigDecimal maxPrice) {
        // If any filter query param supplied treat as search; else broad search with empty criteria
        if (name != null || category != null || minPrice != null || maxPrice != null) {
            return sweetService.search(new SweetSearchCriteria(name, category, minPrice, maxPrice));
        }
        return sweetService.search(new SweetSearchCriteria(null, null, null, null));
    }

    // Dedicated search endpoint (legacy from plan) still supported
    @GetMapping("/search")
    public List<SweetResponse> search(@RequestParam(name = "name", required = false) String name,
                                      @RequestParam(name = "category", required = false) String category,
                                      @RequestParam(name = "minPrice", required = false) BigDecimal minPrice,
                                      @RequestParam(name = "maxPrice", required = false) BigDecimal maxPrice) {
        return sweetService.search(new SweetSearchCriteria(name, category, minPrice, maxPrice));
    }

    @PostMapping
    public ResponseEntity<SweetResponse> create(@Valid @RequestBody CreateSweetRequest request) {
        SweetResponse created = sweetService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public SweetResponse update(@PathVariable Long id, @Valid @RequestBody UpdateSweetRequest request) {
        return sweetService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        sweetService.delete(id);
    }

    @PostMapping("/{id}/purchase")
    public SweetResponse purchase(@PathVariable Long id,
                                  @RequestParam @Positive(message = "quantity must be > 0") int quantity) {
        return sweetService.purchase(id, quantity);
    }

    @PostMapping("/{id}/restock")
    @PreAuthorize("hasRole('ADMIN')")
    public SweetResponse restock(@PathVariable Long id,
                                 @RequestParam @Min(value = 1, message = "quantity must be >= 1") int quantity) {
        return sweetService.restock(id, quantity);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SweetResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(sweetService.getById(id));
    }
}
