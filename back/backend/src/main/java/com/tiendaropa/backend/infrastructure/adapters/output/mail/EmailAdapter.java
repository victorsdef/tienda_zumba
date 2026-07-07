package com.tiendaropa.backend.infrastructure.adapters.output.mail;

import com.tiendaropa.backend.application.ports.output.EmailPort;
import com.tiendaropa.backend.domain.model.Orden;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import jakarta.mail.internet.MimeMessage;
import java.util.List;
import java.util.Map;

@Component
@Slf4j
public class EmailAdapter implements EmailPort {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired(required = false)
    private RestTemplate restTemplate;

    @Value("${app.mail.from:no-reply@example.com}")
    private String from;

    @Value("${app.mail.admin:admin@example.com}")
    private String adminEmail;

    @Value("${app.mail.resend.api-key:}")
    private String resendApiKey;

    @Value("${app.mail.resend.api-url:https://api.resend.com/emails}")
    private String resendApiUrl;

    @Override
    public void enviarVerificacion(String destinatario, String nombre, String token) {
        String body = "Verificá tu cuenta: token=" + token;
        enviar(destinatario, "Verificá tu correo", body);
    }

    @Override
    public void enviarBienvenida(String destinatario, String nombre) {
        enviar(destinatario, "Bienvenida a la tienda", "¡Bienvenido/a, " + nombre + "!");
    }

    @Override
    public void enviarConfirmacionOrden(String destinatario, String nombre, String codigoOrden, String total) {
        enviar(destinatario, "Orden " + codigoOrden + " confirmada", "Total: " + total);
    }

    @Override
    public void enviarFacturaCliente(Orden orden) {
        String nombre = orden.getNombreInvitado();
        String email  = orden.getEmailInvitado();
        if (email == null) return;
        String html = "Factura simplificada";
        enviar(email, "Pedido " + (orden.getCodigoOrden() != null ? orden.getCodigoOrden() : "#" + orden.getId()) + " confirmado", html);
    }

    @Override
    public void enviarNotificacionAdmin(Orden orden) {
        enviar(adminEmail, "Nuevo pedido " + (orden.getCodigoOrden() != null ? orden.getCodigoOrden() : "#" + orden.getId()), "Nuevo pedido recibido");
    }

    @Override
    public void enviarPagoCancelado(String destinatario, String nombre, String codigoOrden) {
        enviar(destinatario, "Problema con el pago", "Orden: " + codigoOrden);
    }

    @Override
    public void enviarEnPreparacion(String destinatario, String nombre, String codigoOrden) {
        enviar(destinatario, "Tu pedido está en preparación", "Orden: " + codigoOrden);
    }

    @Override
    public void enviarEnviado(String destinatario, String nombre, String codigoOrden, String numeroGuia) {
        enviar(destinatario, "Tu pedido está en camino", "Orden: " + codigoOrden + ", guía: " + numeroGuia);
    }

    @Override
    public void enviarEntregado(String destinatario, String nombre, String codigoOrden) {
        enviar(destinatario, "Pedido entregado", "Orden: " + codigoOrden);
    }

    private void enviar(String destinatario, String asunto, String html) {
        try {
            if (resendApiKey != null && !resendApiKey.isBlank() && restTemplate != null) {
                enviarConResend(destinatario, asunto, html);
            } else if (mailSender != null) {
                enviarConSmtp(destinatario, asunto, html);
            } else {
                log.info("[EMAIL SIMULADO] To: {} | Subject: {} | Body: {}", destinatario, asunto, html);
            }
        } catch (Exception e) {
            log.error("Error enviando email a {}: {}", destinatario, e.getMessage());
        }
    }

    private void enviarConSmtp(String destinatario, String asunto, String html) throws Exception {
        MimeMessage msg = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
        helper.setFrom(from);
        helper.setTo(destinatario);
        helper.setSubject(asunto);
        helper.setText(html, true);
        mailSender.send(msg);
    }

    private void enviarConResend(String destinatario, String asunto, String html) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(resendApiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> payload = Map.of(
            "from", from,
            "to", List.of(destinatario),
            "subject", asunto,
            "html", html
        );

        ResponseEntity<String> response = restTemplate.postForEntity(resendApiUrl, new HttpEntity<>(payload, headers), String.class);
        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new IllegalStateException("Resend devolvio estado " + response.getStatusCode().value());
        }
    }
}
