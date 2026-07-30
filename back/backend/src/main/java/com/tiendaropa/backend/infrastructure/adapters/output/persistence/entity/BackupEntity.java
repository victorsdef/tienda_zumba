package com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "backups")
@Getter
@Setter
public class BackupEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fecha_proceso", nullable = false)
    private LocalDateTime fechaProceso;

    @Column(nullable = false)
    private String estado; // OK, ERROR, EN_PROCESO

    @Column(name = "tamano_bytes")
    private Long tamanoBytes;

    @Column(name = "duracion_ms")
    private Long duracionMs;

    @Column(columnDefinition = "TEXT")
    private String ubicacionUrl;

    @Column(columnDefinition = "TEXT")
    private String mensaje;

    @Column(name = "es_manual", nullable = false)
    private boolean esManual = false;
}
