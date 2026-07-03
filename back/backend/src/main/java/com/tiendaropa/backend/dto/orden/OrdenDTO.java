package com.tiendaropa.backend.dto.orden;

import com.tiendaropa.backend.entity.enums.EstadoOrden;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrdenDTO {
    private Long id;
    private String codigoOrden;
    private Long usuarioId;
    private String usuarioNombre;
    private String nombreInvitado;
    private String emailInvitado;
    private List<ItemOrdenDTO> items;
    private BigDecimal total;
    private EstadoOrden estado;
    private String nombreEnvio;
    private String celularEnvio;
    private String provinciaEnvio;
    private String cantonEnvio;
    private String ciudadEnvio;
    private String calleEnvio;
    private BigDecimal costoEnvio;
    private String payphoneTransactionId;
    private String codigoAutorizacion;
    private String marcaTarjeta;
    private String numeroGuia;
    private String guiaImagenUrl;
    private LocalDateTime fechaCreacion;
}
