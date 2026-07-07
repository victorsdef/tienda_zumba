package com.tiendaropa.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "configuracion")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Configuracion {

    @Id
    @Column(name = "clave", length = 100)
    private String clave;

    @Column(nullable = false)
    private String valor;

    private String descripcion;
}
