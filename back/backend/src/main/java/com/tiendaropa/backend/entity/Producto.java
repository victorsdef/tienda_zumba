package com.tiendaropa.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "productos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String sku;

    @Column(unique = true)
    private String slug;

    @Column(nullable = false)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(nullable = false)
    private BigDecimal precio;

    private BigDecimal precioOriginal;

    @Column(nullable = false)
    private Integer stock;

    private boolean activo = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @ElementCollection
    @CollectionTable(name = "producto_imagenes", joinColumns = @JoinColumn(name = "producto_id"))
    @Column(name = "url")
    @Builder.Default
    private List<String> imagenes = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "producto_tallas", joinColumns = @JoinColumn(name = "producto_id"))
    @Column(name = "talla")
    @Builder.Default
    private List<String> tallas = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "producto_colores", joinColumns = @JoinColumn(name = "producto_id"))
    @Column(name = "color")
    @Builder.Default
    private List<String> colores = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "producto_stock_color", joinColumns = @JoinColumn(name = "producto_id"))
    @MapKeyColumn(name = "color")
    @Column(name = "stock")
    @Builder.Default
    private Map<String, Integer> stockPorColor = new LinkedHashMap<>();

    private String caracteristicaTitulo;

    @Column(columnDefinition = "TEXT")
    private String caracteristicaDescripcion;
}
