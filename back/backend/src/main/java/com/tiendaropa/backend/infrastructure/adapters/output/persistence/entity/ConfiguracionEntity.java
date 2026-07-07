package com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "configuraciones")
@Getter
@Setter
public class ConfiguracionEntity {

    @Id
    @Column(nullable = false, updatable = false)
    private String clave;

    @Column(columnDefinition = "TEXT")
    private String valor;

    @Column(columnDefinition = "TEXT")
    private String descripcion;
}
