package com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "direcciones")
@Getter
@Setter
public class DireccionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private UsuarioEntity usuario;

    @Column(name = "nombre_completo")
    private String nombreCompleto;

    private String celular;
    private String cedula;
    private String provincia;
    private String canton;
    private String ciudad;

    @Column(name = "direccion")
    private String direccion;

    @Column(nullable = false)
    private boolean predeterminada;
}
