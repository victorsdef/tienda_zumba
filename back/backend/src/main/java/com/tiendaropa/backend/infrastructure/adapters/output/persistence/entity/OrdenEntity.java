package com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ordenes")
@Getter
@Setter
public class OrdenEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo_orden")
    private String codigoOrden;

    private Long usuarioId;
    private String nombreInvitado;
    private String emailInvitado;

    @OneToMany(mappedBy = "orden", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrdenItemEntity> items = new ArrayList<>();

    @Column(precision = 12, scale = 2)
    private BigDecimal total;

    private String estado;
    private String nombreEnvio;
    private String celularEnvio;
    private String provinciaEnvio;
    private String cantonEnvio;
    private String ciudadEnvio;
    private String calleEnvio;
    private String tipoEntrega;

    @Column(precision = 12, scale = 2)
    private BigDecimal costoEnvio;

    private String payphoneTransactionId;
    private String codigoAutorizacion;
    private String marcaTarjeta;
    private String numeroGuia;

    @Column(columnDefinition = "TEXT")
    private String guiaImagenUrl;

    private LocalDateTime fechaCreacion;

    @PrePersist
    protected void onCreate() {
        if (fechaCreacion == null) fechaCreacion = LocalDateTime.now();
    }
}
