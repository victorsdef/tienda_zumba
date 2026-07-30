package com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "colores_personalizados", uniqueConstraints = {
    @UniqueConstraint(columnNames = "hex")
})
@Getter
@Setter
public class ColorPersonalizadoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 60)
    private String nombre;

    @Column(nullable = false, length = 9)
    private String hex; // Ej: #A3B4C5

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();
}
