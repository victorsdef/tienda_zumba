package com.tiendaropa.backend.entity;

import com.tiendaropa.backend.entity.enums.EstadoOrden;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ordenes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Orden {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @OneToMany(mappedBy = "orden", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ItemOrden> items = new ArrayList<>();

    @Column(nullable = false)
    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoOrden estado;

    private String calleEnvio;
    private String ciudadEnvio;
    private String provinciaEnvio;
    private String codigoPostalEnvio;

    @Column(nullable = false)
    private LocalDateTime fechaCreacion;

    @PrePersist
    public void prePersist() {
        fechaCreacion = LocalDateTime.now();
        if (estado == null) estado = EstadoOrden.PENDIENTE;
    }
}
