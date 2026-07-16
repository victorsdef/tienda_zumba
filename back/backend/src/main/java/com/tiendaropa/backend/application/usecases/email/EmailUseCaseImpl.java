package com.tiendaropa.backend.application.usecases.email;

import com.tiendaropa.backend.application.ports.input.EmailUseCase;
import com.tiendaropa.backend.application.ports.output.EmailPort;
import com.tiendaropa.backend.domain.model.Orden;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailUseCaseImpl implements EmailUseCase {

    private final EmailPort emailPort;

    @Override
    public void enviarVerificacion(String destinatario, String nombre, String token) {
        emailPort.enviarVerificacion(destinatario, nombre, token);
    }

    @Override
    public void enviarBienvenida(String destinatario, String nombre) {
        emailPort.enviarBienvenida(destinatario, nombre);
    }

    @Override
    public void enviarConfirmacionOrden(String destinatario, String nombre, String codigoOrden, String total) {
        emailPort.enviarConfirmacionOrden(destinatario, nombre, codigoOrden, total);
    }

    @Override
    public void enviarFacturaCliente(Orden orden) { emailPort.enviarFacturaCliente(orden); }

    @Override
    public void enviarNotificacionAdmin(Orden orden) { emailPort.enviarNotificacionAdmin(orden); }

    @Override
    public void enviarPagoCancelado(String destinatario, String nombre, String codigoOrden) {
        emailPort.enviarPagoCancelado(destinatario, nombre, codigoOrden);
    }

    @Override
    public void enviarEnPreparacion(String destinatario, String nombre, String codigoOrden) {
        emailPort.enviarEnPreparacion(destinatario, nombre, codigoOrden);
    }

    @Override
    public void enviarEnviado(String destinatario, String nombre, String codigoOrden, String numeroGuia) {
        emailPort.enviarEnviado(destinatario, nombre, codigoOrden, numeroGuia);
    }

    @Override
    public void enviarEntregado(String destinatario, String nombre, String codigoOrden) {
        emailPort.enviarEntregado(destinatario, nombre, codigoOrden);
    }

    @Override
    public void enviarRecuperacionPassword(String destinatario, String nombre, String token) {
        emailPort.enviarRecuperacionPassword(destinatario, nombre, token);
    }
}
