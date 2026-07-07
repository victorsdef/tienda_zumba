package com.tiendaropa.backend.domain.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class Orden {

    private Long id;
    private String codigoOrden;
    private Long usuarioId;
    private String nombreInvitado;
    private String emailInvitado;
    private List<OrdenItem> items = new ArrayList<>();
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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCodigoOrden() { return codigoOrden; }
    public void setCodigoOrden(String codigoOrden) { this.codigoOrden = codigoOrden; }
    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
    public String getNombreInvitado() { return nombreInvitado; }
    public void setNombreInvitado(String nombreInvitado) { this.nombreInvitado = nombreInvitado; }
    public String getEmailInvitado() { return emailInvitado; }
    public void setEmailInvitado(String emailInvitado) { this.emailInvitado = emailInvitado; }
    public List<OrdenItem> getItems() { return items; }
    public void setItems(List<OrdenItem> items) { this.items = items; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public String getNombreEnvio() { return nombreEnvio; }
    public void setNombreEnvio(String nombreEnvio) { this.nombreEnvio = nombreEnvio; }
    public String getCelularEnvio() { return celularEnvio; }
    public void setCelularEnvio(String celularEnvio) { this.celularEnvio = celularEnvio; }
    public String getProvinciaEnvio() { return provinciaEnvio; }
    public void setProvinciaEnvio(String provinciaEnvio) { this.provinciaEnvio = provinciaEnvio; }
    public String getCantonEnvio() { return cantonEnvio; }
    public void setCantonEnvio(String cantonEnvio) { this.cantonEnvio = cantonEnvio; }
    public String getCiudadEnvio() { return ciudadEnvio; }
    public void setCiudadEnvio(String ciudadEnvio) { this.ciudadEnvio = ciudadEnvio; }
    public String getCalleEnvio() { return calleEnvio; }
    public void setCalleEnvio(String calleEnvio) { this.calleEnvio = calleEnvio; }
    public String getTipoEntrega() { return tipoEntrega; }
    public void setTipoEntrega(String tipoEntrega) { this.tipoEntrega = tipoEntrega; }
    public BigDecimal getCostoEnvio() { return costoEnvio; }
    public void setCostoEnvio(BigDecimal costoEnvio) { this.costoEnvio = costoEnvio; }
    public String getPayphoneTransactionId() { return payphoneTransactionId; }
    public void setPayphoneTransactionId(String payphoneTransactionId) { this.payphoneTransactionId = payphoneTransactionId; }
    public String getCodigoAutorizacion() { return codigoAutorizacion; }
    public void setCodigoAutorizacion(String codigoAutorizacion) { this.codigoAutorizacion = codigoAutorizacion; }
    public String getMarcaTarjeta() { return marcaTarjeta; }
    public void setMarcaTarjeta(String marcaTarjeta) { this.marcaTarjeta = marcaTarjeta; }
    public String getNumeroGuia() { return numeroGuia; }
    public void setNumeroGuia(String numeroGuia) { this.numeroGuia = numeroGuia; }
    public String getGuiaImagenUrl() { return guiaImagenUrl; }
    public void setGuiaImagenUrl(String guiaImagenUrl) { this.guiaImagenUrl = guiaImagenUrl; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
}
