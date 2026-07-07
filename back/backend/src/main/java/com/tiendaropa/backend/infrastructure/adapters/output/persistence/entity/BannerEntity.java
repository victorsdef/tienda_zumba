package com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "banners")
@Getter
@Setter
public class BannerEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    private String imagenUrl;
    private String enlace;
    private Integer orden;

    @Column(nullable = false)
    private boolean activo;

    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
}
