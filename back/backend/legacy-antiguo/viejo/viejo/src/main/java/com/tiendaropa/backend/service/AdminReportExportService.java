package com.tiendaropa.backend.service;

import com.tiendaropa.backend.dto.admin.DashboardStatsDTO;
import com.tiendaropa.backend.dto.admin.ExportarReporteRequest;
import com.tiendaropa.backend.dto.admin.ProductoStockBajoDTO;
import com.tiendaropa.backend.dto.admin.ProductoTopDTO;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminReportExportService {

    private final AdminService adminService;

    public byte[] exportarReporte(ExportarReporteRequest req) {
        int stockThreshold = normalizarEntero(req.getUmbralStockBajo(), 5, 1, 1000);
        int topLimit = normalizarEntero(req.getLimiteTopProductos(), 10, 1, 100);
        DashboardStatsDTO stats = adminService.getDashboardStats(stockThreshold, topLimit);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            CreationHelper creationHelper = workbook.getCreationHelper();
            CellStyle titleStyle = crearTitleStyle(workbook);
            CellStyle sectionStyle = crearSectionStyle(workbook);
            CellStyle labelStyle = crearLabelStyle(workbook);
            CellStyle moneyStyle = crearMoneyStyle(workbook, creationHelper);
            CellStyle integerStyle = crearIntegerStyle(workbook, creationHelper);
            CellStyle textStyle = crearTextStyle(workbook);

            String nombre = (req.getNombreReporte() != null && !req.getNombreReporte().isBlank())
                ? req.getNombreReporte().trim()
                : "Reporte Sofia Couture EC";

            if (req.isIncluirResumen()) {
                Sheet sheet = workbook.createSheet("Resumen");
                int row = 0;
                row = crearTitulo(sheet, row, nombre, titleStyle);
                row = crearSubtitulo(sheet, row, "Resumen ejecutivo", textStyle);
                row = crearFilaMetrica(sheet, row, "Ventas totales", stats.getVentasTotales().doubleValue(), labelStyle, moneyStyle);
                row = crearFilaMetrica(sheet, row, "Ventas hoy", stats.getVentasHoy().doubleValue(), labelStyle, moneyStyle);
                row = crearFilaMetrica(sheet, row, "Ventas semana", stats.getVentasSemana().doubleValue(), labelStyle, moneyStyle);
                row = crearFilaMetrica(sheet, row, "Ventas mes", stats.getVentasMes().doubleValue(), labelStyle, moneyStyle);
                row = crearFilaMetrica(sheet, row, "Órdenes totales", stats.getTotalOrdenes(), labelStyle, integerStyle);
                row = crearFilaMetrica(sheet, row, "Órdenes pendientes", stats.getTotalOrdenesPendientes(), labelStyle, integerStyle);
                row = crearFilaMetrica(sheet, row, "Clientes totales", stats.getTotalClientes(), labelStyle, integerStyle);
                row = crearFilaMetrica(sheet, row, "Clientes verificados", stats.getTotalClientesVerificados(), labelStyle, integerStyle);
                ajustarColumnas(sheet, 3);
            }

            if (req.isIncluirVentasPeriodo()) {
                Sheet sheet = workbook.createSheet("Ventas por periodo");
                int row = 0;
                row = crearTitulo(sheet, row, "Ventas por periodo", titleStyle);
                row = crearEncabezados(sheet, row, new String[] { "Periodo", "Ventas", "Órdenes" }, sectionStyle);
                row = crearFilaPeriodo(sheet, row, "Hoy", stats.getVentasHoy().doubleValue(), stats.getOrdenesHoy(), moneyStyle, integerStyle);
                row = crearFilaPeriodo(sheet, row, "Últimos 7 días", stats.getVentasSemana().doubleValue(), stats.getOrdenesSemana(), moneyStyle, integerStyle);
                row = crearFilaPeriodo(sheet, row, "Mes actual", stats.getVentasMes().doubleValue(), stats.getOrdenesMes(), moneyStyle, integerStyle);
                ajustarColumnas(sheet, 3);
            }

            if (req.isIncluirOrdenesEstado()) {
                Sheet sheet = workbook.createSheet("Órdenes por estado");
                int row = 0;
                row = crearTitulo(sheet, row, "Distribución de órdenes", titleStyle);
                row = crearEncabezados(sheet, row, new String[] { "Estado", "Cantidad" }, sectionStyle);
                for (Map.Entry<String, Long> entry : stats.getOrdenesPorEstado().entrySet()) {
                    Row dataRow = sheet.createRow(row++);
                    crearCelda(dataRow, 0, entry.getKey(), textStyle);
                    crearCelda(dataRow, 1, entry.getValue(), integerStyle);
                }
                ajustarColumnas(sheet, 2);
            }

            if (req.isIncluirTopProductos()) {
                Sheet sheet = workbook.createSheet("Top productos");
                int row = 0;
                row = crearTitulo(sheet, row, "Top productos más vendidos", titleStyle);
                row = crearEncabezados(sheet, row, new String[] { "Posición", "Producto", "Unidades vendidas", "Ingresos" }, sectionStyle);
                int posicion = 1;
                for (ProductoTopDTO producto : stats.getTopProductos()) {
                    Row dataRow = sheet.createRow(row++);
                    crearCelda(dataRow, 0, posicion++, integerStyle);
                    crearCelda(dataRow, 1, producto.getNombre(), textStyle);
                    crearCelda(dataRow, 2, producto.getUnidadesVendidas(), integerStyle);
                    crearCelda(dataRow, 3, producto.getIngresos().doubleValue(), moneyStyle);
                }
                ajustarColumnas(sheet, 4);
            }

            if (req.isIncluirStockBajo()) {
                Sheet sheet = workbook.createSheet("Stock bajo");
                int row = 0;
                row = crearTitulo(sheet, row, "Productos con stock bajo", titleStyle);
                row = crearSubtitulo(sheet, row, "Umbral aplicado: " + stockThreshold + " unidades", textStyle);
                row = crearEncabezados(sheet, row, new String[] { "ID", "Producto", "Stock" }, sectionStyle);
                for (ProductoStockBajoDTO producto : stats.getProductosStockBajo()) {
                    Row dataRow = sheet.createRow(row++);
                    crearCelda(dataRow, 0, producto.getId(), integerStyle);
                    crearCelda(dataRow, 1, producto.getNombre(), textStyle);
                    crearCelda(dataRow, 2, producto.getStock(), integerStyle);
                }
                ajustarColumnas(sheet, 3);
            }

            if (req.isIncluirMetadatos()) {
                Sheet sheet = workbook.createSheet("Metadatos");
                int row = 0;
                row = crearTitulo(sheet, row, "Configuración del reporte", titleStyle);
                row = crearFilaTexto(sheet, row, "Generado", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")), labelStyle, textStyle);
                row = crearFilaTexto(sheet, row, "Nombre del reporte", nombre, labelStyle, textStyle);
                row = crearFilaTexto(sheet, row, "Incluye resumen", siNo(req.isIncluirResumen()), labelStyle, textStyle);
                row = crearFilaTexto(sheet, row, "Incluye ventas por periodo", siNo(req.isIncluirVentasPeriodo()), labelStyle, textStyle);
                row = crearFilaTexto(sheet, row, "Incluye órdenes por estado", siNo(req.isIncluirOrdenesEstado()), labelStyle, textStyle);
                row = crearFilaTexto(sheet, row, "Incluye top productos", siNo(req.isIncluirTopProductos()), labelStyle, textStyle);
                row = crearFilaTexto(sheet, row, "Incluye stock bajo", siNo(req.isIncluirStockBajo()), labelStyle, textStyle);
                row = crearFilaTexto(sheet, row, "Incluye metadatos", siNo(req.isIncluirMetadatos()), labelStyle, textStyle);
                row = crearFilaTexto(sheet, row, "Límite top productos", String.valueOf(topLimit), labelStyle, textStyle);
                row = crearFilaTexto(sheet, row, "Umbral stock bajo", String.valueOf(stockThreshold), labelStyle, textStyle);
                ajustarColumnas(sheet, 2);
            }

            workbook.write(output);
            return output.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("No se pudo generar el archivo Excel", e);
        }
    }

    private int crearTitulo(Sheet sheet, int rowIndex, String titulo, CellStyle style) {
        Row row = sheet.createRow(rowIndex++);
        Cell cell = row.createCell(0);
        cell.setCellValue(titulo);
        cell.setCellStyle(style);
        return rowIndex;
    }

    private int crearSubtitulo(Sheet sheet, int rowIndex, String texto, CellStyle style) {
        Row row = sheet.createRow(rowIndex++);
        Cell cell = row.createCell(0);
        cell.setCellValue(texto);
        cell.setCellStyle(style);
        return rowIndex;
    }

    private int crearEncabezados(Sheet sheet, int rowIndex, String[] headers, CellStyle style) {
        Row row = sheet.createRow(rowIndex++);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = row.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(style);
        }
        return rowIndex;
    }

    private int crearFilaMetrica(Sheet sheet, int rowIndex, String label, double value, CellStyle labelStyle, CellStyle valueStyle) {
        Row row = sheet.createRow(rowIndex++);
        crearCelda(row, 0, label, labelStyle);
        crearCelda(row, 1, value, valueStyle);
        return rowIndex;
    }

    private int crearFilaMetrica(Sheet sheet, int rowIndex, String label, long value, CellStyle labelStyle, CellStyle valueStyle) {
        Row row = sheet.createRow(rowIndex++);
        crearCelda(row, 0, label, labelStyle);
        crearCelda(row, 1, value, valueStyle);
        return rowIndex;
    }

    private int crearFilaTexto(Sheet sheet, int rowIndex, String label, String value, CellStyle labelStyle, CellStyle valueStyle) {
        Row row = sheet.createRow(rowIndex++);
        crearCelda(row, 0, label, labelStyle);
        crearCelda(row, 1, value, valueStyle);
        return rowIndex;
    }

    private int crearFilaPeriodo(Sheet sheet, int rowIndex, String periodo, double ventas, long ordenes, CellStyle moneyStyle, CellStyle integerStyle) {
        Row row = sheet.createRow(rowIndex++);
        crearCelda(row, 0, periodo, null);
        crearCelda(row, 1, ventas, moneyStyle);
        crearCelda(row, 2, ordenes, integerStyle);
        return rowIndex;
    }

    private void crearCelda(Row row, int cellIndex, String value, CellStyle style) {
        Cell cell = row.createCell(cellIndex);
        cell.setCellValue(value);
        if (style != null) cell.setCellStyle(style);
    }

    private void crearCelda(Row row, int cellIndex, long value, CellStyle style) {
        Cell cell = row.createCell(cellIndex);
        cell.setCellValue(value);
        if (style != null) cell.setCellStyle(style);
    }

    private void crearCelda(Row row, int cellIndex, double value, CellStyle style) {
        Cell cell = row.createCell(cellIndex);
        cell.setCellValue(value);
        if (style != null) cell.setCellStyle(style);
    }

    private void ajustarColumnas(Sheet sheet, int totalColumns) {
        for (int i = 0; i < totalColumns; i++) {
            sheet.autoSizeColumn(i);
            sheet.setColumnWidth(i, Math.min(sheet.getColumnWidth(i) + 800, 12000));
        }
    }

    private CellStyle crearTitleStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 16);
        style.setFont(font);
        return style;
    }

    private CellStyle crearSectionStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.BROWN.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }

    private CellStyle crearLabelStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        return style;
    }

    private CellStyle crearTextStyle(Workbook workbook) {
        return workbook.createCellStyle();
    }

    private CellStyle crearMoneyStyle(Workbook workbook, CreationHelper creationHelper) {
        CellStyle style = workbook.createCellStyle();
        style.setDataFormat(creationHelper.createDataFormat().getFormat("$#,##0.00"));
        return style;
    }

    private CellStyle crearIntegerStyle(Workbook workbook, CreationHelper creationHelper) {
        CellStyle style = workbook.createCellStyle();
        style.setDataFormat(creationHelper.createDataFormat().getFormat("#,##0"));
        return style;
    }

    private int normalizarEntero(Integer value, int defaultValue, int min, int max) {
        if (value == null) return defaultValue;
        return Math.max(min, Math.min(max, value));
    }

    private String siNo(boolean value) {
        return value ? "Sí" : "No";
    }
}
