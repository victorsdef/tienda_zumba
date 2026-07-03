package com.tiendaropa.backend.service;

import com.tiendaropa.backend.entity.ItemOrden;
import com.tiendaropa.backend.entity.Orden;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String from;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.mail.admin}")
    private String adminEmail;

    @Async
    public void enviarVerificacion(String destinatario, String nombre, String token) {
        String enlace = frontendUrl + "/verificar-email?token=" + token;
        String html = """
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#f5f0e8;padding:0;border-radius:8px;overflow:hidden">
              <div style="background:#7d5c48;padding:28px 32px;text-align:center">
                <h1 style="color:#f5f0e8;margin:0;font-size:22px;letter-spacing:1px">sofia couture ec</h1>
              </div>
              <div style="padding:32px">
                <h2 style="color:#4a3728;margin-top:0">Hola, %s 👋</h2>
                <p style="color:#9c7a62;line-height:1.6">
                  Gracias por registrarte. Para activar tu cuenta y poder iniciar sesión, confirmá tu correo electrónico:
                </p>
                <div style="text-align:center;margin:32px 0">
                  <a href="%s"
                     style="background:#7d5c48;color:#f5f0e8;text-decoration:none;padding:14px 36px;border-radius:4px;font-weight:bold;font-size:14px">
                    Verificar mi correo
                  </a>
                </div>
                <p style="color:#a8998a;font-size:12px;text-align:center">
                  Si no creaste una cuenta, ignorá este mensaje.
                </p>
                <p style="color:#a8998a;font-size:12px;text-align:center;margin-top:24px">
                  ¿Preguntas? Escribinos al WhatsApp: +593 98 393 4596
                </p>
              </div>
              <div style="background:#4a3728;padding:16px;text-align:center">
                <p style="color:#6b5a4a;font-size:11px;margin:0">© 2025 Sofia Couture EC · Ecuador</p>
              </div>
            </div>
            """.formatted(nombre, enlace);
        enviar(destinatario, "Verificá tu correo — Sofia Couture EC", html);
    }

    @Async
    public void enviarBienvenida(String destinatario, String nombre) {
        String html = """
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#f5f0e8;padding:0;border-radius:8px;overflow:hidden">
              <div style="background:#7d5c48;padding:28px 32px;text-align:center">
                <h1 style="color:#f5f0e8;margin:0;font-size:22px;letter-spacing:1px">sofia couture ec</h1>
              </div>
              <div style="padding:32px">
                <h2 style="color:#4a3728;margin-top:0">¡Bienvenida/o, %s! 🎉</h2>
                <p style="color:#9c7a62;line-height:1.6">
                  Tu cuenta ha sido creada exitosamente. Ya podés explorar nuestra colección y hacer tu primer pedido.
                </p>
                <div style="text-align:center;margin:28px 0">
                  <a href="%s/catalogo"
                     style="background:#7d5c48;color:#f5f0e8;text-decoration:none;padding:12px 32px;border-radius:4px;font-weight:bold;font-size:14px">
                    Ver colección
                  </a>
                </div>
                <p style="color:#a8998a;font-size:12px;text-align:center;margin-top:24px">
                  ¿Preguntas? Escribinos al WhatsApp: +593 98 393 4596
                </p>
              </div>
              <div style="background:#4a3728;padding:16px;text-align:center">
                <p style="color:#6b5a4a;font-size:11px;margin:0">© 2025 Sofia Couture EC · Ecuador</p>
              </div>
            </div>
            """.formatted(nombre, frontendUrl);
        enviar(destinatario, "¡Bienvenida/o a Sofia Couture EC!", html);
    }

    @Async
    public void enviarConfirmacionOrden(String destinatario, String nombre, String codigoOrden, String total) {
        String html = """
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#f5f0e8;padding:0;border-radius:8px;overflow:hidden">
              <div style="background:#7d5c48;padding:28px 32px;text-align:center">
                <h1 style="color:#f5f0e8;margin:0;font-size:22px;letter-spacing:1px">sofia couture ec</h1>
              </div>
              <div style="padding:32px">
                <h2 style="color:#4a3728;margin-top:0">¡Orden confirmada! ✅</h2>
                <p style="color:#9c7a62;line-height:1.6">Hola <strong>%s</strong>, recibimos tu pedido correctamente.</p>
                <div style="background:white;border:1px solid #ddd8d0;border-radius:6px;padding:16px 20px;margin:20px 0">
                  <p style="margin:4px 0;color:#7d5c48;font-size:14px"><strong>Código de orden:</strong> %s</p>
                  <p style="margin:4px 0;color:#7d5c48;font-size:14px"><strong>Total:</strong> $%s</p>
                </div>
                <p style="color:#9c7a62;line-height:1.6;font-size:14px">
                  Pronto nos pondremos en contacto para coordinar la entrega. También podés seguir tu pedido desde tu cuenta.
                </p>
                <div style="text-align:center;margin:28px 0">
                  <a href="%s/ordenes"
                     style="background:#7d5c48;color:#f5f0e8;text-decoration:none;padding:12px 32px;border-radius:4px;font-weight:bold;font-size:14px">
                    Ver mis órdenes
                  </a>
                </div>
                <p style="color:#a8998a;font-size:12px;text-align:center;margin-top:24px">
                  ¿Preguntas? Escribinos al WhatsApp: +593 98 393 4596
                </p>
              </div>
              <div style="background:#4a3728;padding:16px;text-align:center">
                <p style="color:#6b5a4a;font-size:11px;margin:0">© 2025 Sofia Couture EC · Ecuador</p>
              </div>
            </div>
            """.formatted(nombre, codigoOrden, total, frontendUrl);
        enviar(destinatario, "Orden " + codigoOrden + " confirmada — Sofia Couture EC", html);
    }

    @Async
    public void enviarFacturaCliente(Orden orden) {
        String nombre = orden.getUsuario() != null ? orden.getUsuario().getNombre() : orden.getNombreInvitado();
        String email  = orden.getUsuario() != null ? orden.getUsuario().getEmail()  : orden.getEmailInvitado();
        if (email == null) return;

        String html = construirHtmlFactura(orden, nombre, false);
        enviar(email, "Pedido " + codigoVisible(orden) + " confirmado — Sofia Couture EC", html);
    }

    @Async
    public void enviarNotificacionAdmin(Orden orden) {
        String nombreCliente = orden.getUsuario() != null ? orden.getUsuario().getNombre() : orden.getNombreInvitado();
        String emailCliente  = orden.getUsuario() != null ? orden.getUsuario().getEmail()  : orden.getEmailInvitado();
        enviarNotificacionAdminPreparada(
            construirHtmlNotificacionAdmin(orden, nombreCliente, emailCliente),
            "Nuevo pedido " + codigoVisible(orden) + " — $" + orden.getTotal()
        );
    }

    public String construirHtmlNotificacionAdmin(Orden orden, String nombreCliente, String emailCliente) {
        return construirHtmlFactura(orden, nombreCliente, true)
            .replace("sofia couture ec", "NUEVO PEDIDO — Sofia Couture EC")
            .replace("¡Gracias por tu compra!", "Cliente: " + nombreCliente + " &lt;" + emailCliente + "&gt;");
    }

    @Async
    public void enviarNotificacionAdminPreparada(String html, String asunto) {
        enviar(adminEmail, asunto, html);
    }

    private String construirHtmlFactura(Orden orden, String nombre, boolean esAdmin) {
        StringBuilder items = new StringBuilder();
        for (ItemOrden item : orden.getItems()) {
            String variante = "";
            if (item.getTalla() != null && !item.getTalla().isBlank()) variante += " · " + item.getTalla();
            if (item.getColor() != null && !item.getColor().isBlank())
                variante += " · <span style='display:inline-block;width:12px;height:12px;border-radius:50%;background:" + item.getColor() + ";vertical-align:middle;border:1px solid #ddd'></span>";
            items.append("""
                <tr>
                  <td style="padding:10px 8px;border-bottom:1px solid #f0ebe3;font-size:13px;color:#7d5c48">
                    %s%s
                  </td>
                  <td style="padding:10px 8px;border-bottom:1px solid #f0ebe3;text-align:center;font-size:13px;color:#9c7a62">x%d</td>
                  <td style="padding:10px 8px;border-bottom:1px solid #f0ebe3;text-align:right;font-size:13px;font-weight:bold;color:#4a3728">$%.2f</td>
                </tr>
                """.formatted(item.getNombreProducto(), variante, item.getCantidad(),
                    item.getPrecio().multiply(java.math.BigDecimal.valueOf(item.getCantidad())).doubleValue()));
        }

        String subtotal = orden.getTotal().subtract(orden.getCostoEnvio() != null ? orden.getCostoEnvio() : java.math.BigDecimal.ZERO).toString();
        String envio = orden.getCostoEnvio() != null && orden.getCostoEnvio().compareTo(java.math.BigDecimal.ZERO) > 0
            ? "$" + orden.getCostoEnvio() : "Gratis";
        String direccion = orden.getCalleEnvio() != null
            ? orden.getCalleEnvio() + ", " + orden.getCiudadEnvio() + ", " + orden.getCantonEnvio() + ", " + orden.getProvinciaEnvio()
            : "Retiro en tienda";
        String tarjeta = orden.getMarcaTarjeta() != null ? " · " + orden.getMarcaTarjeta() : "";
        String auth = orden.getCodigoAutorizacion() != null ? " #" + orden.getCodigoAutorizacion() : "";

        return """
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f0e8;padding:0;border-radius:8px;overflow:hidden">
              <div style="background:#7d5c48;padding:28px 32px;text-align:center">
                <h1 style="color:#f5f0e8;margin:0;font-size:22px;letter-spacing:1px">sofia couture ec</h1>
                <p style="color:#c9b99a;margin:6px 0 0;font-size:13px">%s</p>
              </div>
              <div style="padding:28px 32px">
                <h2 style="color:#4a3728;margin-top:0">%s</h2>
                <p style="color:#9c7a62;font-size:14px;margin-bottom:4px">Código de orden: <strong>%s</strong></p>
                <p style="color:#9c7a62;font-size:13px;margin-top:4px">Pago autorizado%s%s</p>

                <!-- Items -->
                <table width="100%%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:20px 0;background:white;border-radius:6px;overflow:hidden">
                  <thead>
                    <tr style="background:#7d5c48">
                      <th style="padding:10px 8px;text-align:left;color:#f5f0e8;font-size:11px;font-weight:600;text-transform:uppercase">Producto</th>
                      <th style="padding:10px 8px;text-align:center;color:#f5f0e8;font-size:11px;font-weight:600;text-transform:uppercase">Cant.</th>
                      <th style="padding:10px 8px;text-align:right;color:#f5f0e8;font-size:11px;font-weight:600;text-transform:uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody>%s</tbody>
                </table>

                <!-- Totales -->
                <table width="100%%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px">
                  <tr>
                    <td style="padding:4px 0;font-size:13px;color:#9c7a62">Subtotal</td>
                    <td style="padding:4px 0;font-size:13px;color:#9c7a62;text-align:right">$%s</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;font-size:13px;color:#9c7a62">Envío</td>
                    <td style="padding:4px 0;font-size:13px;color:#9c7a62;text-align:right">%s</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0 4px;font-size:16px;font-weight:bold;color:#4a3728;border-top:2px solid #ddd8d0">Total pagado</td>
                    <td style="padding:8px 0 4px;font-size:16px;font-weight:bold;color:#4a3728;text-align:right;border-top:2px solid #ddd8d0">$%s</td>
                  </tr>
                </table>

                <!-- Dirección -->
                <div style="background:white;border:1px solid #ddd8d0;border-radius:6px;padding:14px 18px;margin-bottom:20px">
                  <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;color:#a8998a;letter-spacing:1px">Dirección de entrega</p>
                  <p style="margin:0;font-size:13px;color:#7d5c48">%s</p>
                  <p style="margin:4px 0 0;font-size:13px;color:#9c7a62">%s · %s</p>
                </div>

                %s
                <p style="color:#a8998a;font-size:12px;text-align:center;margin-top:24px">
                  ¿Preguntas? Escribinos al WhatsApp: +593 98 393 4596
                </p>
              </div>
              <div style="background:#4a3728;padding:16px;text-align:center">
                <p style="color:#6b5a4a;font-size:11px;margin:0">© 2025 Sofia Couture EC · Ecuador</p>
              </div>
            </div>
            """.formatted(
                esAdmin ? "Panel de administración" : "¡Gracias por tu compra!",
                esAdmin ? "Nuevo pedido recibido 🛍️" : "¡Pedido confirmado! ✅",
                codigoVisible(orden),
                tarjeta,
                auth,
                items.toString(),
                subtotal,
                envio,
                orden.getTotal(),
                direccion,
                orden.getNombreEnvio() != null ? orden.getNombreEnvio() : nombre,
                orden.getCelularEnvio() != null ? orden.getCelularEnvio() : "",
                esAdmin ? "" : """
                    <div style="text-align:center;margin:20px 0">
                      <a href="%s/ordenes" style="background:#7d5c48;color:#f5f0e8;text-decoration:none;padding:12px 28px;border-radius:4px;font-weight:bold;font-size:14px">
                        Ver mis órdenes
                      </a>
                    </div>
                    """.formatted(frontendUrl)
            );
    }

    @Async
    public void enviarPagoCancelado(String destinatario, String nombre, String codigoOrden) {
        String html = """
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#f5f0e8;padding:0;border-radius:8px;overflow:hidden">
              <div style="background:#7d5c48;padding:28px 32px;text-align:center">
                <h1 style="color:#f5f0e8;margin:0;font-size:22px;letter-spacing:1px">sofia couture ec</h1>
              </div>
              <div style="padding:32px">
                <h2 style="color:#4a3728;margin-top:0">Pago no completado ❌</h2>
                <p style="color:#9c7a62;line-height:1.6">Hola <strong>%s</strong>, lamentablemente el pago de tu orden <strong>%s</strong> no pudo procesarse.</p>
                <p style="color:#9c7a62;line-height:1.6;font-size:14px">
                  Podés intentar nuevamente desde tu cuenta o contactarnos por WhatsApp para coordinar otro medio de pago.
                </p>
                <div style="text-align:center;margin:28px 0">
                  <a href="%s/ordenes"
                     style="background:#7d5c48;color:#f5f0e8;text-decoration:none;padding:12px 32px;border-radius:4px;font-weight:bold;font-size:14px">
                    Ver mis órdenes
                  </a>
                </div>
                <p style="color:#a8998a;font-size:12px;text-align:center;margin-top:24px">
                  ¿Preguntas? Escribinos al WhatsApp: +593 98 393 4596
                </p>
              </div>
              <div style="background:#4a3728;padding:16px;text-align:center">
                <p style="color:#6b5a4a;font-size:11px;margin:0">© 2025 Sofia Couture EC · Ecuador</p>
              </div>
            </div>
            """.formatted(nombre, codigoOrden, frontendUrl);
        enviar(destinatario, "Problema con el pago — Orden " + codigoOrden, html);
    }

    @Async
    public void enviarEnPreparacion(String destinatario, String nombre, String codigoOrden) {
        String html = """
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#f5f0e8;padding:0;border-radius:8px;overflow:hidden">
              <div style="background:#7d5c48;padding:28px 32px;text-align:center">
                <h1 style="color:#f5f0e8;margin:0;font-size:22px;letter-spacing:1px">sofia couture ec</h1>
              </div>
              <div style="padding:32px">
                <h2 style="color:#4a3728;margin-top:0">Tu pedido está siendo preparado 📦</h2>
                <p style="color:#9c7a62;line-height:1.6">Hola <strong>%s</strong>, estamos preparando tu orden <strong>%s</strong> con mucho cuidado.</p>
                <p style="color:#9c7a62;line-height:1.6;font-size:14px">
                  En breve te avisaremos cuando sea enviado con Servientrega.
                </p>
                <p style="color:#a8998a;font-size:12px;text-align:center;margin-top:24px">
                  ¿Preguntas? Escribinos al WhatsApp: +593 98 393 4596
                </p>
              </div>
              <div style="background:#4a3728;padding:16px;text-align:center">
                <p style="color:#6b5a4a;font-size:11px;margin:0">© 2025 Sofia Couture EC · Ecuador</p>
              </div>
            </div>
            """.formatted(nombre, codigoOrden);
        enviar(destinatario, "Tu pedido " + codigoOrden + " está en preparación", html);
    }

    @Async
    public void enviarEnviado(String destinatario, String nombre, String codigoOrden, String numeroGuia) {
        String guiaHtml = (numeroGuia != null && !numeroGuia.isBlank())
            ? """
              <div style="background:white;border:1px solid #ddd8d0;border-radius:6px;padding:16px 20px;margin:20px 0;text-align:center">
                <p style="margin:0;color:#9c7a62;font-size:13px">Número de guía Servientrega</p>
                <p style="margin:8px 0 0;color:#7d5c48;font-size:22px;font-weight:bold;letter-spacing:2px">%s</p>
              </div>
              """.formatted(numeroGuia)
            : "";
        String html = """
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#f5f0e8;padding:0;border-radius:8px;overflow:hidden">
              <div style="background:#7d5c48;padding:28px 32px;text-align:center">
                <h1 style="color:#f5f0e8;margin:0;font-size:22px;letter-spacing:1px">sofia couture ec</h1>
              </div>
              <div style="padding:32px">
                <h2 style="color:#4a3728;margin-top:0">¡Tu pedido está en camino! 🚚</h2>
                <p style="color:#9c7a62;line-height:1.6">Hola <strong>%s</strong>, tu orden <strong>%s</strong> fue entregada a Servientrega.</p>
                %s
                <p style="color:#9c7a62;line-height:1.6;font-size:14px">
                  Podés rastrear tu envío en el sitio de Servientrega con el número de guía.
                </p>
                <p style="color:#a8998a;font-size:12px;text-align:center;margin-top:24px">
                  ¿Preguntas? Escribinos al WhatsApp: +593 98 393 4596
                </p>
              </div>
              <div style="background:#4a3728;padding:16px;text-align:center">
                <p style="color:#6b5a4a;font-size:11px;margin:0">© 2025 Sofia Couture EC · Ecuador</p>
              </div>
            </div>
            """.formatted(nombre, codigoOrden, guiaHtml);
        enviar(destinatario, "Tu pedido " + codigoOrden + " está en camino", html);
    }

    @Async
    public void enviarEntregado(String destinatario, String nombre, String codigoOrden) {
        String html = """
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#f5f0e8;padding:0;border-radius:8px;overflow:hidden">
              <div style="background:#7d5c48;padding:28px 32px;text-align:center">
                <h1 style="color:#f5f0e8;margin:0;font-size:22px;letter-spacing:1px">sofia couture ec</h1>
              </div>
              <div style="padding:32px">
                <h2 style="color:#4a3728;margin-top:0">¡Pedido entregado! 🎉</h2>
                <p style="color:#9c7a62;line-height:1.6">Hola <strong>%s</strong>, tu orden <strong>%s</strong> fue entregada exitosamente.</p>
                <p style="color:#9c7a62;line-height:1.6;font-size:14px">
                  Esperamos que disfrutes tu compra. Si tenés alguna duda o querés hacer un cambio, no dudés en contactarnos.
                </p>
                <p style="color:#a8998a;font-size:12px;text-align:center;margin-top:24px">
                  ¿Preguntas? Escribinos al WhatsApp: +593 98 393 4596
                </p>
              </div>
              <div style="background:#4a3728;padding:16px;text-align:center">
                <p style="color:#6b5a4a;font-size:11px;margin:0">© 2025 Sofia Couture EC · Ecuador</p>
              </div>
            </div>
            """.formatted(nombre, codigoOrden);
        enviar(destinatario, "Pedido " + codigoOrden + " entregado — Gracias por tu compra", html);
    }

    private String codigoVisible(Orden orden) {
        return orden.getCodigoOrden() != null && !orden.getCodigoOrden().isBlank()
            ? orden.getCodigoOrden()
            : "#" + orden.getId();
    }

    private void enviar(String destinatario, String asunto, String html) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom(from);
            helper.setTo(destinatario);
            helper.setSubject(asunto);
            helper.setText(html, true);
            mailSender.send(msg);
            log.info("Email enviado a {}: {}", destinatario, asunto);
        } catch (Exception e) {
            log.error("Error enviando email a {}: {}", destinatario, e.getMessage());
        }
    }
}
