package com.tiendaropa.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "banners")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Banner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tag;

    @Column(nullable = false)
    private String titulo;

    private String subtitulo;

    private String ctaTexto;

    // CATALOGO | GENERO | CATEGORIA | PRODUCTO | URL
    private String tipoDestino;

    // valor según tipo: "MUJER", "12", "45", "/catalogo"
    private String destinoValor;

    private String colorDesde;
    private String colorHasta;
    private String imagen;

    private int orden;

    @Builder.Default
    private boolean activo = true;
}
