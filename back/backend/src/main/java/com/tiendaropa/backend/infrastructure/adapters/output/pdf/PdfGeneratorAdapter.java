package com.tiendaropa.backend.infrastructure.adapters.output.pdf;

import com.tiendaropa.backend.application.ports.output.PdfGeneratorPort;
import com.tiendaropa.backend.domain.model.Orden;
import com.tiendaropa.backend.domain.model.OrdenItem;
import org.apache.batik.transcoder.TranscoderInput;
import org.apache.batik.transcoder.TranscoderOutput;
import org.apache.batik.transcoder.image.PNGTranscoder;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.graphics.image.LosslessFactory;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.StringReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
public class PdfGeneratorAdapter implements PdfGeneratorPort {

    private static final float MARGIN = 50f;
    private static final float PAGE_WIDTH  = PDRectangle.A4.getWidth();
    private static final float PAGE_HEIGHT = PDRectangle.A4.getHeight();

    // Brand colors
    private static final float[] BROWN_DARK   = { 74f/255, 55f/255, 40f/255 };   // #4a3728
    private static final float[] BROWN_MED    = {125f/255, 92f/255, 72f/255 };   // #7d5c48
    private static final float[] CREAM        = {245f/255,237f/255,230f/255 };   // #f5ede6
    private static final float[] WHITE        = { 1f, 1f, 1f };
    private static final float[] DARK_TEXT    = { 0.15f, 0.10f, 0.07f };

    @Override
    public byte[] generarFactura(Orden orden) {
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            doc.addPage(page);

            PDImageXObject logo = loadLogo(doc);

            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                float y = PAGE_HEIGHT - MARGIN;

                // ── Header background bar ──────────────────────────────────
                float headerH = logo != null ? 72f : 50f;
                fillRect(cs, 0, PAGE_HEIGHT - headerH, PAGE_WIDTH, headerH, BROWN_DARK);

                // Logo
                if (logo != null) {
                    float logoH = 48f;
                    float logoW = logoH * ((float) logo.getWidth() / logo.getHeight());
                    cs.drawImage(logo, MARGIN, PAGE_HEIGHT - headerH + (headerH - logoH) / 2f, logoW, logoH);
                } else {
                    // Fallback text if logo fails
                    cs.setNonStrokingColor(WHITE[0], WHITE[1], WHITE[2]);
                    cs.setFont(PDType1Font.HELVETICA_BOLD, 22);
                    cs.beginText();
                    cs.newLineAtOffset(MARGIN, PAGE_HEIGHT - headerH + 16f);
                    cs.showText("Sofia Couture EC");
                    cs.endText();
                }

                // Website text on header right side
                cs.setNonStrokingColor(CREAM[0], CREAM[1], CREAM[2]);
                cs.setFont(PDType1Font.HELVETICA, 9);
                cs.beginText();
                cs.newLineAtOffset(PAGE_WIDTH - MARGIN - 130, PAGE_HEIGHT - headerH + 12f);
                cs.showText("sofiacoutureec.com  |  Ecuador");
                cs.endText();

                y = PAGE_HEIGHT - headerH - 20f;

                // ── Título comprobante ────────────────────────────────────
                cs.setNonStrokingColor(BROWN_DARK[0], BROWN_DARK[1], BROWN_DARK[2]);
                cs.setFont(PDType1Font.HELVETICA_BOLD, 14);
                cs.beginText();
                cs.newLineAtOffset(MARGIN, y);
                cs.showText("Comprobante de Pedido");
                cs.endText();
                y -= 6f;

                // Separator line (medium brown)
                strokeLine(cs, MARGIN, y, PAGE_WIDTH - MARGIN, y, 1.5f, BROWN_MED);
                y -= 18f;

                // ── Datos del pedido ──────────────────────────────────────
                String codigo = orden.getCodigoOrden() != null ? orden.getCodigoOrden() : ("#" + orden.getId());
                String fecha;
                if (orden.getFechaCreacion() != null) {
                    fecha = orden.getFechaCreacion().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
                } else {
                    fecha = "Sin fecha registrada";
                }
                String estado = orden.getEstado() != null ? orden.getEstado() : "-";

                y = campo(cs, y, "Código:", codigo);
                y = campo(cs, y, "Fecha:", fecha);
                y = campo(cs, y, "Estado:", estado);
                y -= 10f;

                // ── Datos del cliente ─────────────────────────────────────
                String nombreCliente = orden.getNombreEnvio() != null ? orden.getNombreEnvio()
                    : (orden.getNombreInvitado() != null ? orden.getNombreInvitado() : "-");
                String celular = orden.getCelularEnvio() != null ? orden.getCelularEnvio() : "-";

                // Section title with background
                fillRect(cs, MARGIN, y - 3f, PAGE_WIDTH - 2 * MARGIN, 16f, CREAM);
                cs.setNonStrokingColor(BROWN_DARK[0], BROWN_DARK[1], BROWN_DARK[2]);
                cs.setFont(PDType1Font.HELVETICA_BOLD, 10);
                cs.beginText();
                cs.newLineAtOffset(MARGIN + 4, y);
                cs.showText("Datos del cliente");
                cs.endText();
                y -= 18f;

                y = campo(cs, y, "Nombre:", nombreCliente);
                y = campo(cs, y, "Celular:", celular);

                if ("DOMICILIO".equalsIgnoreCase(orden.getTipoEntrega()) || "CUENCA".equalsIgnoreCase(orden.getTipoEntrega())) {
                    y = campo(cs, y, "Dirección:", buildDireccion(orden));
                } else {
                    y = campo(cs, y, "Entrega:", "Retiro en tienda");
                }
                y -= 14f;

                // ── Tabla de productos ────────────────────────────────────
                fillRect(cs, MARGIN, y - 3f, PAGE_WIDTH - 2 * MARGIN, 16f, CREAM);
                cs.setNonStrokingColor(BROWN_DARK[0], BROWN_DARK[1], BROWN_DARK[2]);
                cs.setFont(PDType1Font.HELVETICA_BOLD, 10);
                cs.beginText();
                cs.newLineAtOffset(MARGIN + 4, y);
                cs.showText("Detalle del pedido");
                cs.endText();
                y -= 18f;

                // Table header background
                fillRect(cs, MARGIN, y - 3f, PAGE_WIDTH - 2 * MARGIN, 16f, BROWN_MED);
                float[] colX = { MARGIN + 4, MARGIN + 224, MARGIN + 310, MARGIN + 370, MARGIN + 430 };
                String[] headers = { "Producto", "Variante", "Cant.", "P. Unit.", "Total" };
                cs.setNonStrokingColor(WHITE[0], WHITE[1], WHITE[2]);
                cs.setFont(PDType1Font.HELVETICA_BOLD, 9);
                for (int i = 0; i < headers.length; i++) {
                    cs.beginText();
                    cs.newLineAtOffset(colX[i], y);
                    cs.showText(headers[i]);
                    cs.endText();
                }
                y -= 16f;

                // Rows
                List<OrdenItem> items = orden.getItems() != null ? orden.getItems() : List.of();
                boolean alt = false;
                for (OrdenItem item : items) {
                    if (y < MARGIN + 80) break;
                    if (alt) fillRect(cs, MARGIN, y - 3f, PAGE_WIDTH - 2 * MARGIN, 14f, CREAM);
                    alt = !alt;

                    String nombre   = truncar(safe(item.getNombreProducto()), 32);
                    String variante = truncar(buildVariante(item), 18);
                    String cant     = String.valueOf(item.getCantidad() != null ? item.getCantidad() : 1);
                    BigDecimal pu   = item.getPrecioUnitario() != null ? item.getPrecioUnitario() : BigDecimal.ZERO;
                    BigDecimal tot  = pu.multiply(BigDecimal.valueOf(item.getCantidad() != null ? item.getCantidad() : 1));

                    String[] vals = { nombre, variante, cant,
                        "$" + pu.setScale(2, java.math.RoundingMode.HALF_UP),
                        "$" + tot.setScale(2, java.math.RoundingMode.HALF_UP) };

                    cs.setNonStrokingColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
                    cs.setFont(PDType1Font.HELVETICA, 9);
                    for (int i = 0; i < vals.length; i++) {
                        cs.beginText();
                        cs.newLineAtOffset(colX[i], y);
                        cs.showText(vals[i]);
                        cs.endText();
                    }
                    y -= 14f;
                }

                strokeLine(cs, MARGIN, y, PAGE_WIDTH - MARGIN, y, 0.5f, BROWN_MED);
                y -= 16f;

                // ── Totales ───────────────────────────────────────────────
                BigDecimal costoEnvio  = orden.getCostoEnvio() != null ? orden.getCostoEnvio() : BigDecimal.ZERO;
                BigDecimal totalPedido = orden.getTotal()      != null ? orden.getTotal()       : BigDecimal.ZERO;

                cs.setNonStrokingColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
                if (costoEnvio.compareTo(BigDecimal.ZERO) > 0) {
                    y = totalLinea(cs, y, "Subtotal:", "$" + totalPedido.subtract(costoEnvio).setScale(2, java.math.RoundingMode.HALF_UP));
                    y = totalLinea(cs, y, "Envío:",    "$" + costoEnvio.setScale(2, java.math.RoundingMode.HALF_UP));
                }

                // Total highlight
                float totalBoxY = y - 4f;
                fillRect(cs, PAGE_WIDTH - MARGIN - 210, totalBoxY, 210, 20f, BROWN_DARK);
                cs.setNonStrokingColor(WHITE[0], WHITE[1], WHITE[2]);
                cs.setFont(PDType1Font.HELVETICA_BOLD, 12);
                cs.beginText();
                cs.newLineAtOffset(PAGE_WIDTH - MARGIN - 204, totalBoxY + 4f);
                cs.showText("TOTAL:   $" + totalPedido.setScale(2, java.math.RoundingMode.HALF_UP));
                cs.endText();
                y = totalBoxY - 22f;

                // ── Pie ───────────────────────────────────────────────────
                strokeLine(cs, MARGIN, y, PAGE_WIDTH - MARGIN, y, 0.5f, BROWN_MED);
                y -= 14f;

                cs.setNonStrokingColor(BROWN_MED[0], BROWN_MED[1], BROWN_MED[2]);
                cs.setFont(PDType1Font.HELVETICA, 8);
                cs.beginText();
                cs.newLineAtOffset(MARGIN, y);
                cs.showText("Gracias por tu compra en Sofia Couture EC. Este documento es un comprobante de tu pedido.");
                cs.endText();
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            doc.save(out);
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error generando PDF", e);
        }
    }

    private PDImageXObject loadLogo(PDDocument doc) {
        try (InputStream is = getClass().getResourceAsStream("/sofia_logo.svg")) {
            if (is == null) return null;
            // Recolor logo to cream so it's visible on the dark brown header
            String svgContent = new String(is.readAllBytes(), StandardCharsets.UTF_8)
                .replace("#453f38", "#f5ede6")
                .replace("fill=\"#453f38\"", "fill=\"#f5ede6\"");

            ByteArrayOutputStream pngOut = new ByteArrayOutputStream();
            PNGTranscoder transcoder = new PNGTranscoder();
            transcoder.addTranscodingHint(PNGTranscoder.KEY_WIDTH, 400f);
            TranscoderInput input = new TranscoderInput(new StringReader(svgContent));
            TranscoderOutput output = new TranscoderOutput(pngOut);
            transcoder.transcode(input, output);

            BufferedImage img = ImageIO.read(new ByteArrayInputStream(pngOut.toByteArray()));
            return LosslessFactory.createFromImage(doc, img);
        } catch (Exception e) {
            return null;
        }
    }

    private void fillRect(PDPageContentStream cs, float x, float y, float w, float h,
                          float[] rgb) throws Exception {
        cs.setNonStrokingColor(rgb[0], rgb[1], rgb[2]);
        cs.addRect(x, y, w, h);
        cs.fill();
    }

    private void strokeLine(PDPageContentStream cs, float x1, float y1, float x2, float y2,
                            float width, float[] rgb) throws Exception {
        cs.setStrokingColor(rgb[0], rgb[1], rgb[2]);
        cs.setLineWidth(width);
        cs.moveTo(x1, y1);
        cs.lineTo(x2, y2);
        cs.stroke();
    }

    private float campo(PDPageContentStream cs, float y, String label, String value) throws Exception {
        cs.setNonStrokingColor(BROWN_DARK[0], BROWN_DARK[1], BROWN_DARK[2]);
        cs.setFont(PDType1Font.HELVETICA_BOLD, 9);
        cs.beginText();
        cs.newLineAtOffset(MARGIN, y);
        cs.showText(label);
        cs.endText();

        cs.setNonStrokingColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
        cs.setFont(PDType1Font.HELVETICA, 9);
        cs.beginText();
        cs.newLineAtOffset(MARGIN + 90, y);
        cs.showText(safe(value));
        cs.endText();
        return y - 14f;
    }

    private float totalLinea(PDPageContentStream cs, float y, String label, String value) throws Exception {
        cs.setFont(PDType1Font.HELVETICA, 10);
        cs.beginText();
        cs.newLineAtOffset(PAGE_WIDTH - MARGIN - 204, y);
        cs.showText(label + "   " + value);
        cs.endText();
        return y - 14f;
    }

    private String buildVariante(OrdenItem item) {
        StringBuilder sb = new StringBuilder();
        if (item.getColor() != null && !item.getColor().isBlank()) sb.append(item.getColor());
        if (item.getTalla() != null && !item.getTalla().isBlank()) {
            if (sb.length() > 0) sb.append(" / ");
            sb.append(item.getTalla());
        }
        return sb.length() > 0 ? sb.toString() : "-";
    }

    private String buildDireccion(Orden orden) {
        StringBuilder sb = new StringBuilder();
        if (orden.getCalleEnvio()     != null) sb.append(orden.getCalleEnvio());
        if (orden.getCiudadEnvio()    != null) { if (sb.length() > 0) sb.append(", "); sb.append(orden.getCiudadEnvio()); }
        if (orden.getCantonEnvio()    != null) { if (sb.length() > 0) sb.append(", "); sb.append(orden.getCantonEnvio()); }
        if (orden.getProvinciaEnvio() != null) { if (sb.length() > 0) sb.append(", "); sb.append(orden.getProvinciaEnvio()); }
        return sb.length() > 0 ? sb.toString() : "-";
    }

    private String safe(String s) {
        if (s == null) return "-";
        return s.replaceAll("[\\x00-\\x1F\\u2014]", "-").trim();
    }

    private String truncar(String s, int max) {
        if (s == null) return "-";
        return s.length() > max ? s.substring(0, max - 1) + "~" : s;
    }
}
