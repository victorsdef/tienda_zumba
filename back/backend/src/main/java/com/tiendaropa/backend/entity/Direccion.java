package com.tiendaropa.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "direcciones")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Direccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false)
    private String nombreCompleto;

    @Column(nullable = false)
    private String celular;

    @Column(nullable = false)
    private String cedula;

    @Column(nullable = false)
    private String provincia;

    @Column(nullable = false)
    private String canton;

    @Column(nullable = false)
    private String ciudad;

    @Column(nullable = false)
    private String direccion;

    @Builder.Default
    private boolean predeterminada = false;
}
