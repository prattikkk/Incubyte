package com.example.sweet_shop.repository;

import com.example.sweet_shop.domain.Sweet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface SweetRepository extends JpaRepository<Sweet, Long>, JpaSpecificationExecutor<Sweet> {
    Optional<Sweet> findByName(String name);
    boolean existsByName(String name);
}
