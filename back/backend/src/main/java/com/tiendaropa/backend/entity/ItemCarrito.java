package com.tiendaropa.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "items_carrito")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ItemCarrito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carrito_id", nullable = false)
    private Carrito carrito;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    private Integer cantidad;
    private String talla;
    private String color;
}
