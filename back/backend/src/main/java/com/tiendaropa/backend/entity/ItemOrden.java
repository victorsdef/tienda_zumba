package com.tiendaropa.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "items_orden")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ItemOrden {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orden_id", nullable = false)
    private Orden orden;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "producto_id")
    private Producto producto;

    private String nombreProducto;
    private Integer cantidad;
    private BigDecimal precio;
    private String talla;
    private String color;
}
