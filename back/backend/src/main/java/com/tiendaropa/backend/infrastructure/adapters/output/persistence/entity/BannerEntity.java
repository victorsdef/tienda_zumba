package com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "banners")
@Getter
@Setter
public class BannerEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tag;

    @Column(nullable = false)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String subtitulo;

    private String ctaTexto;
    private String tipoDestino;
    private String destinoValor;
    private String colorDesde;
    private String colorHasta;
    private String imagenUrl;
    private Integer orden;

    @Column(nullable = false)
    private boolean activo;
}
