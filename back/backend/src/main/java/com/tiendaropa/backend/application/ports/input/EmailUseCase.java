package com.tiendaropa.backend.application.ports.input;

import com.tiendaropa.backend.domain.model.Orden;

public interface EmailUseCase {
    void enviarVerificacion(String destinatario, String nombre, String token);
    void enviarBienvenida(String destinatario, String nombre);
    void enviarConfirmacionOrden(String destinatario, String nombre, String codigoOrden, String total);
    void enviarFacturaCliente(Orden orden);
    void enviarNotificacionAdmin(Orden orden);
    void enviarPagoCancelado(String destinatario, String nombre, String codigoOrden);
    void enviarEnPreparacion(String destinatario, String nombre, String codigoOrden);
    void enviarEnviado(String destinatario, String nombre, String codigoOrden, String numeroGuia);
    void enviarEntregado(String destinatario, String nombre, String codigoOrden);
}
