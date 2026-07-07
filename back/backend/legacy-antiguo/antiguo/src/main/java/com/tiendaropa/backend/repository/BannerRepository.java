package com.tiendaropa.backend.repository;

import com.tiendaropa.backend.entity.Banner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BannerRepository extends JpaRepository<Banner, Long> {
    List<Banner> findByActivoTrueOrderByOrdenAsc();
    List<Banner> findAllByOrderByOrdenAsc();
    long countByActivoTrue();
}
