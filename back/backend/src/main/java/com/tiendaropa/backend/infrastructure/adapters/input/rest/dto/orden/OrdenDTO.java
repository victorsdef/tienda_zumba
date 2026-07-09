package com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.orden;

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
    private String estado;
    private String nombreEnvio;
    private String celularEnvio;
    private String provinciaEnvio;
    private String cantonEnvio;
    private String ciudadEnvio;
    private String calleEnvio;
    private String tipoEntrega;
    private BigDecimal costoEnvio;
    private String payphoneTransactionId;
    private String codigoAutorizacion;
    private String marcaTarjeta;
    private String numeroGuia;
    private String guiaImagenUrl;
    private LocalDateTime fechaCreacion;
}
