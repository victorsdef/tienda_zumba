package com.tiendaropa.backend.dto.orden;

import com.tiendaropa.backend.entity.enums.EstadoOrden;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrdenDTO {
    private Long id;
    private Long usuarioId;
    private String usuarioNombre;
    private List<ItemOrdenDTO> items;
    private BigDecimal total;
    private EstadoOrden estado;
    private String calleEnvio;
    private String ciudadEnvio;
    private String provinciaEnvio;
    private String codigoPostalEnvio;
    private LocalDateTime fechaCreacion;
}
