package com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cupones")
@Getter @Setter
public class CuponEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String codigo;

    @Column(nullable = false, length = 20)
    private String tipo;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;

    @Column(name = "monto_minimo", precision = 10, scale = 2)
    private BigDecimal montoMinimo;

    @Column(name = "max_usos")
    private Integer maxUsos;

    @Column(nullable = false)
    private int usos = 0;

    @Column(nullable = false)
    private boolean activo = true;

    @Column(name = "fecha_expiracion")
    private LocalDateTime fechaExpiracion;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "producto_id")
    private Long productoId;

    @Column(name = "categoria_id")
    private Long categoriaId;

    @PrePersist
    public void prePersist() {
        if (fechaCreacion == null) fechaCreacion = LocalDateTime.now();
    }
}
