package com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "orden_items")
@Getter
@Setter
public class OrdenItemEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orden_id")
    private OrdenEntity orden;

    private Long productoId;
    private String nombreProducto;
    private Integer cantidad;

    @Column(precision = 12, scale = 2)
    private BigDecimal precio;

    private String talla;
    private String color;
}
