package com.example.sweet_shop.service;

import com.example.sweet_shop.domain.Sweet;
import com.example.sweet_shop.error.NotFoundException;
import com.example.sweet_shop.dto.sweet.*;
import com.example.sweet_shop.repository.SweetRepository;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;
import java.util.ArrayList;

@Service
public class SweetService {

    private final SweetRepository sweetRepository;

    public SweetService(SweetRepository sweetRepository) {
        this.sweetRepository = sweetRepository;
    }

    @Transactional
    public SweetResponse create(CreateSweetRequest request) {
        if (sweetRepository.existsByName(request.name())) {
            throw new IllegalArgumentException("sweet name already exists");
        }
        Sweet sweet = Sweet.builder()
                .name(request.name())
                .category(request.category())
                .price(request.price())
                .quantity(request.quantity())
                .build();
        return toResponse(sweetRepository.save(sweet));
    }

    @Transactional
    public SweetResponse update(Long id, UpdateSweetRequest request) {
        Sweet sweet = sweetRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("sweet not found"));
        if (!sweet.getName().equals(request.name()) && sweetRepository.existsByName(request.name())) {
            throw new IllegalArgumentException("sweet name already exists");
        }
        sweet.setName(request.name());
        sweet.setCategory(request.category());
        sweet.setPrice(request.price());
        sweet.setQuantity(request.quantity());
        return toResponse(sweet);
    }

    @Transactional
    public SweetResponse purchase(Long id, int quantity) {
        if (quantity <= 0) throw new IllegalArgumentException("quantity must be positive");
    Sweet sweet = sweetRepository.findById(id)
        .orElseThrow(() -> new NotFoundException("sweet not found"));
        if (sweet.getQuantity() < quantity) {
            throw new IllegalArgumentException("insufficient stock");
        }
        sweet.setQuantity(sweet.getQuantity() - quantity);
        return toResponse(sweet);
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public SweetResponse restock(Long id, int quantity) {
        if (quantity <= 0) throw new IllegalArgumentException("quantity must be positive");
    Sweet sweet = sweetRepository.findById(id)
        .orElseThrow(() -> new NotFoundException("sweet not found"));
        sweet.setQuantity(sweet.getQuantity() + quantity);
        return toResponse(sweet);
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(Long id) {
    Sweet sweet = sweetRepository.findById(id)
        .orElseThrow(() -> new NotFoundException("sweet not found"));
        sweetRepository.delete(sweet);
    }

    @Transactional(readOnly = true)
    public List<SweetResponse> search(SweetSearchCriteria criteria) {
        Specification<Sweet> spec = buildSpec(criteria);
        return sweetRepository.findAll(spec).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public SweetResponse getById(Long id) {
    Sweet sweet = sweetRepository.findById(id)
        .orElseThrow(() -> new NotFoundException("sweet not found"));
        return toResponse(sweet);
    }

    private SweetResponse toResponse(Sweet s) {
        return new SweetResponse(s.getId(), s.getName(), s.getCategory(), s.getPrice(), s.getQuantity(), s.getCreatedAt(), s.getUpdatedAt());
    }

    // Build dynamic specification chaining only non-null predicates (avoids deprecated allOf/where usage)
    private Specification<Sweet> buildSpec(SweetSearchCriteria c) {
        List<Specification<Sweet>> parts = new ArrayList<>();
        parts.add(nameContains(c.name()));
        parts.add(categoryEquals(c.category()));
        parts.add(priceMin(c.minPrice()));
        parts.add(priceMax(c.maxPrice()));
        Specification<Sweet> spec = null;
        for (Specification<Sweet> p : parts) {
            if (p != null) {
                spec = (spec == null) ? p : spec.and(p);
            }
        }
        return spec;
    }

    private Specification<Sweet> nameContains(String v) {
        if (v == null || v.isBlank()) return null;
        String pattern = "%" + v.toLowerCase() + "%";
        return (root, q, cb) -> cb.like(cb.lower(root.get("name")), pattern);
    }
    private Specification<Sweet> categoryEquals(String v) {
        if (v == null || v.isBlank()) return null;
        return (root, q, cb) -> cb.equal(root.get("category"), v);
    }
    private Specification<Sweet> priceMin(java.math.BigDecimal v) {
        if (v == null) return null;
        return (root, q, cb) -> cb.greaterThanOrEqualTo(root.get("price"), v);
    }
    private Specification<Sweet> priceMax(java.math.BigDecimal v) {
        if (v == null) return null;
        return (root, q, cb) -> cb.lessThanOrEqualTo(root.get("price"), v);
    }
}
