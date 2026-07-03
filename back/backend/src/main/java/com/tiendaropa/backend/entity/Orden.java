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

    @Column(unique = true)
    private String codigoOrden;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = true)
    private Usuario usuario;

    private String nombreInvitado;
    private String emailInvitado;

    @OneToMany(mappedBy = "orden", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ItemOrden> items = new ArrayList<>();

    @Column(nullable = false)
    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoOrden estado;

    private String nombreEnvio;
    private String celularEnvio;
    private String provinciaEnvio;
    private String cantonEnvio;
    private String ciudadEnvio;
    private String calleEnvio;
    private java.math.BigDecimal costoEnvio;

    // Payphone
    private String payphoneTransactionId;
    private String codigoAutorizacion;
    private String marcaTarjeta;

    // Servientrega
    private String numeroGuia;
    private String guiaImagenUrl;

    @Column(nullable = false)
    private LocalDateTime fechaCreacion;

    @PrePersist
    public void prePersist() {
        fechaCreacion = LocalDateTime.now();
        if (estado == null) estado = EstadoOrden.PENDIENTE;
    }
}
