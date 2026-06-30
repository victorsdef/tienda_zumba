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
    private String calle;

    @Column(nullable = false)
    private String ciudad;

    private String provincia;

    private String codigoPostal;

    private String referencias;
}
