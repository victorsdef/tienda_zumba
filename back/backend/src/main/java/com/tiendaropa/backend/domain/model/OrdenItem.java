package com.tiendaropa.backend.domain.model;

import java.math.BigDecimal;

public class OrdenItem {

    private Long id;
    private Long productoId;
    private String nombreProducto;
    private String productoImagen;
    private Integer cantidad;
    private BigDecimal precio;
    private BigDecimal precioUnitario;
    private BigDecimal subtotal;
    private String talla;
    private String color;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProductoId() { return productoId; }
    public void setProductoId(Long productoId) { this.productoId = productoId; }
    public String getNombreProducto() { return nombreProducto; }
    public void setNombreProducto(String nombreProducto) { this.nombreProducto = nombreProducto; }
    public String getProductoImagen() { return productoImagen; }
    public void setProductoImagen(String productoImagen) { this.productoImagen = productoImagen; }
    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
    public BigDecimal getPrecio() { return precio; }
    public void setPrecio(BigDecimal precio) {
        this.precio = precio;
        this.precioUnitario = precio;
    }
    public BigDecimal getPrecioUnitario() { return precioUnitario != null ? precioUnitario : precio; }
    public void setPrecioUnitario(BigDecimal precioUnitario) {
        this.precioUnitario = precioUnitario;
        this.precio = precioUnitario;
    }
    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
    public String getTalla() { return talla; }
    public void setTalla(String talla) { this.talla = talla; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
}
