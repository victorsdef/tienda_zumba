package com.tiendaropa.backend.infrastructure.adapters.output.mail;

import com.tiendaropa.backend.application.ports.output.EmailPort;
import com.tiendaropa.backend.domain.model.Orden;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import jakarta.mail.internet.MimeMessage;

@Component
@Slf4j
public class EmailAdapter implements EmailPort {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.mail.from:Sofia Couture EC <no-reply@example.com>}")
    private String from;

    @Value("${app.mail.admin:admin@example.com}")
    private String adminEmail;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    // ── Plantilla base ───────────────────────────────────────────
    private String wrap(String contenido) {
        return """
            <!DOCTYPE html>
            <html lang="es">
            <head>
              <meta charset="UTF-8"/>
              <meta name="viewport" content="width=device-width,initial-scale=1"/>
              <style>
                body{margin:0;padding:0;background:#f5ede6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif}
                .outer{max-width:560px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(74,55,40,.10)}
                .header{background:#4a3728;padding:28px 32px;text-align:center}
                .header h1{color:#f5ede6;font-size:22px;margin:0;letter-spacing:2px;font-weight:400;text-transform:uppercase}
                .header p{color:#c9a87c;font-size:11px;margin:4px 0 0;letter-spacing:3px;text-transform:uppercase}
                .body{padding:32px}
                .body h2{color:#2c1a10;font-size:18px;margin:0 0 8px}
                .body p{color:#555;font-size:14px;line-height:1.7;margin:0 0 12px}
                .badge{display:inline-block;background:#f0ebe4;color:#4a3728;font-size:13px;font-weight:700;padding:8px 18px;border-radius:8px;letter-spacing:1px;margin:8px 0 16px}
                .info-box{background:#faf8f5;border:1px solid #ede8df;border-radius:8px;padding:16px;margin:16px 0}
                .info-box p{margin:4px 0;font-size:13px;color:#444}
                .info-box strong{color:#2c1a10}
                .btn{display:inline-block;background:#4a3728;color:#f5ede6!important;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;margin:16px 0;letter-spacing:.5px}
                .divider{border:none;border-top:1px solid #ede8df;margin:24px 0}
                .footer{background:#faf8f5;padding:20px 32px;text-align:center;border-top:1px solid #ede8df}
                .footer p{color:#9c8a7a;font-size:11px;margin:2px 0}
              </style>
            </head>
            <body>
              <div class="outer">
                <div class="header">
                  <h1>Sofia Couture EC</h1>
                  <p>Moda con esencia</p>
                </div>
                <div class="body">
            """ + contenido + """
                </div>
                <div class="footer">
                  <p>Sofia Couture EC &mdash; Ecuador</p>
                  <p>Este correo fue enviado automáticamente, por favor no respondas.</p>
                </div>
              </div>
            </body>
            </html>
            """;
    }

    // ── Métodos públicos ─────────────────────────────────────────

    @Override
    public void enviarVerificacion(String destinatario, String nombre, String token) {
        String url = frontendUrl + "/verificar-email?token=" + token;
        String html = wrap("""
            <h2>Verifica tu correo</h2>
            <p>Hola <strong>%s</strong>,</p>
            <p>Haz clic en el botón para verificar tu cuenta y empezar a comprar.</p>
            <a class="btn" href="%s">Verificar cuenta</a>
            <hr class="divider"/>
            <p style="font-size:12px;color:#999">Si no creaste esta cuenta, ignora este correo.</p>
            """.formatted(nombre, url));
        enviar(destinatario, "Verifica tu cuenta — Sofia Couture EC", html);
    }

    @Override
    public void enviarBienvenida(String destinatario, String nombre) {
        String html = wrap("""
            <h2>¡Bienvenida a Sofia Couture EC!</h2>
            <p>Hola <strong>%s</strong>,</p>
            <p>Tu cuenta ha sido creada con éxito. Ya puedes explorar toda nuestra colección.</p>
            <a class="btn" href="%s/catalogo">Ver catálogo</a>
            """.formatted(nombre, frontendUrl));
        enviar(destinatario, "Bienvenida a Sofia Couture EC", html);
    }

    @Override
    public void enviarConfirmacionOrden(String destinatario, String nombre, String codigoOrden, String total) {
        String html = wrap("""
            <h2>¡Pedido recibido!</h2>
            <p>Hola <strong>%s</strong>, recibimos tu pedido correctamente.</p>
            <div class="badge">%s</div>
            <div class="info-box">
              <p><strong>Total:</strong> $%s</p>
              <p><strong>Estado:</strong> Pendiente de pago</p>
            </div>
            <p>En cuanto confirmemos el pago, empezaremos a preparar tu pedido.</p>
            <a class="btn" href="%s/mis-ordenes">Ver mis pedidos</a>
            """.formatted(nombre, codigoOrden, total, frontendUrl));
        enviar(destinatario, "Pedido " + codigoOrden + " recibido — Sofia Couture EC", html);
    }

    @Override
    public void enviarFacturaCliente(Orden orden) {
        String email = orden.getEmailInvitado();
        if (email == null || email.isBlank()) return;
        String nombre = orden.getNombreInvitado() != null ? orden.getNombreInvitado() : "Cliente";
        String codigo = orden.getCodigoOrden() != null ? orden.getCodigoOrden() : "#" + orden.getId();
        String total  = orden.getTotal() != null ? orden.getTotal().toPlainString() : "—";
        String html = wrap("""
            <h2>¡Pedido confirmado!</h2>
            <p>Hola <strong>%s</strong>, tu pedido fue registrado exitosamente.</p>
            <div class="badge">%s</div>
            <div class="info-box">
              <p><strong>Total:</strong> $%s</p>
            </div>
            <p>Te avisaremos cuando lo enviemos. ¡Gracias por tu compra!</p>
            """.formatted(nombre, codigo, total));
        enviar(email, "Pedido " + codigo + " — Sofia Couture EC", html);
    }

    @Override
    public void enviarNotificacionAdmin(Orden orden) {
        String codigo = orden.getCodigoOrden() != null ? orden.getCodigoOrden() : "#" + orden.getId();
        String total  = orden.getTotal() != null ? "$" + orden.getTotal().toPlainString() : "—";
        String cliente = orden.getNombreInvitado() != null ? orden.getNombreInvitado() : "Cliente registrado";
        String email   = orden.getEmailInvitado() != null ? orden.getEmailInvitado() : "—";
        String html = wrap("""
            <h2>Nuevo pedido recibido</h2>
            <div class="badge">%s</div>
            <div class="info-box">
              <p><strong>Cliente:</strong> %s</p>
              <p><strong>Email:</strong> %s</p>
              <p><strong>Total:</strong> %s</p>
            </div>
            <a class="btn" href="%s/admin/ordenes">Ver en panel</a>
            """.formatted(codigo, cliente, email, total, frontendUrl));
        enviar(adminEmail, "Nuevo pedido " + codigo, html);
    }

    @Override
    public void enviarPagoCancelado(String destinatario, String nombre, String codigoOrden) {
        String html = wrap("""
            <h2>Pedido cancelado</h2>
            <p>Hola <strong>%s</strong>,</p>
            <p>Tu pedido <strong>%s</strong> fue cancelado.</p>
            <p>Si tienes dudas, escríbenos por WhatsApp.</p>
            """.formatted(nombre, codigoOrden));
        enviar(destinatario, "Pedido " + codigoOrden + " cancelado", html);
    }

    @Override
    public void enviarEnPreparacion(String destinatario, String nombre, String codigoOrden) {
        String html = wrap("""
            <h2>Tu pedido está en preparación</h2>
            <p>Hola <strong>%s</strong>,</p>
            <p>Estamos preparando tu pedido <strong>%s</strong> con mucho cuidado.</p>
            <p>Pronto lo enviaremos. Te avisaremos cuando esté en camino.</p>
            <a class="btn" href="%s/mis-ordenes">Ver estado</a>
            """.formatted(nombre, codigoOrden, frontendUrl));
        enviar(destinatario, "Tu pedido " + codigoOrden + " está en preparación", html);
    }

    @Override
    public void enviarEnviado(String destinatario, String nombre, String codigoOrden, String numeroGuia) {
        String guiaHtml = (numeroGuia != null && !numeroGuia.isBlank())
            ? "<p><strong>Número de guía:</strong> " + numeroGuia + "</p>"
            : "";
        String html = wrap("""
            <h2>¡Tu pedido está en camino!</h2>
            <p>Hola <strong>%s</strong>,</p>
            <p>Tu pedido <strong>%s</strong> ha sido enviado.</p>
            <div class="info-box">
              %s
            </div>
            <a class="btn" href="%s/mis-ordenes">Ver mis pedidos</a>
            """.formatted(nombre, codigoOrden, guiaHtml, frontendUrl));
        enviar(destinatario, "Tu pedido " + codigoOrden + " está en camino", html);
    }

    @Override
    public void enviarEntregado(String destinatario, String nombre, String codigoOrden) {
        String html = wrap("""
            <h2>¡Pedido entregado!</h2>
            <p>Hola <strong>%s</strong>,</p>
            <p>Tu pedido <strong>%s</strong> fue entregado. ¡Esperamos que lo disfrutes!</p>
            <p>Si tienes algún comentario o problema, escríbenos.</p>
            <a class="btn" href="%s/catalogo">Seguir comprando</a>
            """.formatted(nombre, codigoOrden, frontendUrl));
        enviar(destinatario, "Pedido " + codigoOrden + " entregado — ¡Gracias!", html);
    }

    @Override
    public void enviarRecuperacionPassword(String destinatario, String nombre, String token) {
        String url = frontendUrl + "/reset-password?token=" + token;
        String html = wrap("""
            <h2>Recupera tu contraseña</h2>
            <p>Hola <strong>%s</strong>,</p>
            <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón:</p>
            <a class="btn" href="%s">Restablecer contraseña</a>
            <hr class="divider"/>
            <p style="font-size:12px;color:#999">Este enlace expira en 30 minutos. Si no solicitaste esto, ignora este correo.</p>
            """.formatted(nombre, url));
        enviar(destinatario, "Recupera tu contraseña — Sofia Couture EC", html);
    }

    // ── Envío SMTP ───────────────────────────────────────────────
    private void enviar(String destinatario, String asunto, String html) {
        try {
            if (mailSender != null) {
                MimeMessage msg = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
                helper.setFrom(from);
                helper.setTo(destinatario);
                helper.setSubject(asunto);
                helper.setText(html, true);
                mailSender.send(msg);
                log.info("[EMAIL] Enviado a {} | {}", destinatario, asunto);
            } else {
                log.info("[EMAIL SIMULADO] To: {} | Subject: {}", destinatario, asunto);
            }
        } catch (Exception e) {
            log.error("[EMAIL ERROR] To: {} | {}", destinatario, e.getMessage());
        }
    }
}
