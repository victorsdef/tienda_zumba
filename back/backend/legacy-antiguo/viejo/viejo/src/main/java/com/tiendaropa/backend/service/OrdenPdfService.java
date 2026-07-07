package com.tiendaropa.backend.service;

import com.tiendaropa.backend.dto.orden.ItemOrdenDTO;
import com.tiendaropa.backend.dto.orden.OrdenDTO;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class OrdenPdfService {

    private static final float MARGIN = 48f;
    private static final float LINE_HEIGHT = 16f;
    private static final float SMALL_LINE_HEIGHT = 13f;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public byte[] generarPdfPedido(OrdenDTO orden) {
        try (PDDocument document = new PDDocument(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            PDPage page = new PDPage(PDRectangle.LETTER);
            document.addPage(page);

            float[] cursor = new float[] { MARGIN, page.getMediaBox().getHeight() - MARGIN };

            try (PDPageContentStream content = new PDPageContentStream(document, page)) {
                escribirTitulo(content, cursor, "Sofia Couture EC");
                escribirSubtitulo(content, cursor, "Resumen del pedido");
                escribirEspacio(cursor, 6f);

                escribirPar(content, cursor, "Codigo de orden: " + valor(orden.getCodigoOrden(), "#" + orden.getId()));
                escribirPar(content, cursor, "Fecha: " + formatFecha(orden));
                escribirPar(content, cursor, "Estado: " + valor(orden.getEstado() != null ? orden.getEstado().name() : null, "Sin estado"));
                escribirPar(content, cursor, "Cliente: " + valor(orden.getNombreEnvio(), orden.getUsuarioNombre()));
                escribirPar(content, cursor, "Celular: " + valor(orden.getCelularEnvio(), "No especificado"));
                escribirEspacio(cursor, 4f);

                escribirSeccion(content, cursor, "Direccion de entrega");
                escribirPar(content, cursor, valor(orden.getCalleEnvio(), "No especificada"));
                escribirPar(content, cursor, construirCiudadProvincia(orden));
                escribirEspacio(cursor, 4f);

                escribirSeccion(content, cursor, "Productos");
                for (ItemOrdenDTO item : orden.getItems()) {
                    escribirItem(content, cursor, item);
                }

                escribirEspacio(cursor, 6f);
                escribirSeccion(content, cursor, "Resumen");
                double total = orden.getTotal() != null ? orden.getTotal().doubleValue() : 0d;
                double envio = orden.getCostoEnvio() != null ? orden.getCostoEnvio().doubleValue() : 0d;
                double subtotal = Math.max(0d, total - envio);
                escribirPar(content, cursor, "Subtotal: $" + formatMoney(subtotal));
                escribirPar(content, cursor, "Envio: " + (envio > 0 ? "$" + formatMoney(envio) : "Gratis"));
                escribirParNegrita(content, cursor, "Total: $" + formatMoney(total));

                if (orden.getNumeroGuia() != null && !orden.getNumeroGuia().isBlank()) {
                    escribirEspacio(cursor, 4f);
                    escribirSeccion(content, cursor, "Guia");
                    escribirPar(content, cursor, "Numero de guia: " + orden.getNumeroGuia());
                }
            }

            document.save(output);
            return output.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("No se pudo generar el PDF del pedido", e);
        }
    }

    private void escribirTitulo(PDPageContentStream content, float[] cursor, String text) throws IOException {
        escribirTexto(content, cursor, text, PDType1Font.HELVETICA_BOLD, 20f, LINE_HEIGHT + 4f);
    }

    private void escribirSubtitulo(PDPageContentStream content, float[] cursor, String text) throws IOException {
        escribirTexto(content, cursor, text, PDType1Font.HELVETICA, 11f, LINE_HEIGHT);
    }

    private void escribirSeccion(PDPageContentStream content, float[] cursor, String text) throws IOException {
        escribirTexto(content, cursor, text, PDType1Font.HELVETICA_BOLD, 13f, LINE_HEIGHT);
    }

    private void escribirPar(PDPageContentStream content, float[] cursor, String text) throws IOException {
        escribirTexto(content, cursor, text, PDType1Font.HELVETICA, 10.5f, SMALL_LINE_HEIGHT);
    }

    private void escribirParNegrita(PDPageContentStream content, float[] cursor, String text) throws IOException {
        escribirTexto(content, cursor, text, PDType1Font.HELVETICA_BOLD, 11f, LINE_HEIGHT);
    }

    private void escribirItem(PDPageContentStream content, float[] cursor, ItemOrdenDTO item) throws IOException {
        String nombre = valor(item.getNombreProducto(), "Producto");
        String variacion = construirVariacion(item);
        double subtotal = item.getPrecio() != null ? item.getPrecio().doubleValue() * item.getCantidad() : 0d;

        escribirParNegrita(content, cursor, nombre);
        if (!variacion.isBlank()) {
            escribirPar(content, cursor, variacion);
        }
        escribirPar(content, cursor, "Cantidad: " + item.getCantidad() + "  |  Unitario: $" + formatMoney(item.getPrecio() != null ? item.getPrecio().doubleValue() : 0d) + "  |  Subtotal: $" + formatMoney(subtotal));
        escribirEspacio(cursor, 4f);
    }

    private void escribirTexto(PDPageContentStream content, float[] cursor, String text, PDType1Font font, float fontSize, float step) throws IOException {
        content.beginText();
        content.setFont(font, fontSize);
        content.newLineAtOffset(cursor[0], cursor[1]);
        content.showText(limpiar(text));
        content.endText();
        cursor[1] -= step;
    }

    private void escribirEspacio(float[] cursor, float amount) {
        cursor[1] -= amount;
    }

    private String construirCiudadProvincia(OrdenDTO orden) {
        String ciudad = valor(orden.getCiudadEnvio(), null);
        String canton = valor(orden.getCantonEnvio(), null);
        String provincia = valor(orden.getProvinciaEnvio(), null);
        StringBuilder sb = new StringBuilder();
        if (ciudad != null) sb.append(ciudad);
        if (canton != null) {
            if (!sb.isEmpty()) sb.append(", ");
            sb.append(canton);
        }
        if (provincia != null) {
            if (!sb.isEmpty()) sb.append(", ");
            sb.append(provincia);
        }
        return sb.isEmpty() ? "Ubicacion no especificada" : sb.toString();
    }

    private String construirVariacion(ItemOrdenDTO item) {
        StringBuilder sb = new StringBuilder();
        if (item.getTalla() != null && !item.getTalla().isBlank()) {
            sb.append("Talla: ").append(item.getTalla().trim());
        }
        if (item.getColor() != null && !item.getColor().isBlank()) {
            if (!sb.isEmpty()) sb.append(" | ");
            sb.append("Color: ").append(item.getColor().trim());
        }
        return sb.toString();
    }

    private String formatFecha(OrdenDTO orden) {
        if (orden.getFechaCreacion() == null) return "No disponible";
        return orden.getFechaCreacion()
            .atZone(ZoneId.systemDefault())
            .format(DATE_FORMATTER);
    }

    private String formatMoney(double value) {
        return String.format(java.util.Locale.US, "%.2f", value);
    }

    private String valor(String value, String fallback) {
        if (value == null || value.isBlank()) return fallback;
        return value.trim();
    }

    private String limpiar(String text) {
        return (text == null ? "" : text)
            .replace('\n', ' ')
            .replace('\r', ' ')
            .replace('\t', ' ');
    }
}
