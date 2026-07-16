package com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "productos")
@Getter
@Setter
public class ProductoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal precio;

    @Column(nullable = false)
    private int stock;

    @Column(nullable = false)
    private boolean activo = true;

    @Column(unique = true)
    private String sku;

    @Column(unique = true)
    private String slug;

    @Column(precision = 12, scale = 2)
    private BigDecimal precioOriginal;

    private Boolean aplicaIva = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id")
    private CategoriaEntity categoria;

    @ElementCollection
    @CollectionTable(name = "producto_imagenes", joinColumns = @JoinColumn(name = "producto_id"))
    @Column(name = "imagen")
    private List<String> imagenes = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "producto_tallas", joinColumns = @JoinColumn(name = "producto_id"))
    @Column(name = "talla")
    private List<String> tallas = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "producto_colores", joinColumns = @JoinColumn(name = "producto_id"))
    @Column(name = "color")
    private List<String> colores = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "producto_stock_por_color", joinColumns = @JoinColumn(name = "producto_id"))
    @MapKeyColumn(name = "color")
    @Column(name = "stock")
    private Map<String, Integer> stockPorColor = new LinkedHashMap<>();

    @Column(columnDefinition = "TEXT")
    private String stockPorColorTallaJson;

    @Column(columnDefinition = "TEXT")
    private String imagenesPorColorJson;

    @Column(columnDefinition = "TEXT")
    private String precioPorColorTallaJson;

    private String caracteristicaTitulo;

    @Column(columnDefinition = "TEXT")
    private String caracteristicaDescripcion;
}
