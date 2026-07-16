package com.tiendaropa.backend.domain.model;

public class Producto {

    private Long id;
    private String nombre;
    private String descripcion;
    private java.math.BigDecimal precio;
    private int stock;
    private boolean activo = true;
    private String sku;
    private String slug;
    private java.math.BigDecimal precioOriginal;
    private Boolean aplicaIva = true;
    private Categoria categoria;
    private java.util.List<String> imagenes = new java.util.ArrayList<>();
    private java.util.List<String> tallas = new java.util.ArrayList<>();
    private java.util.List<String> colores = new java.util.ArrayList<>();
    private java.util.Map<String, Integer> stockPorColor = new java.util.LinkedHashMap<>();
    private String stockPorColorTallaJson;
    private String imagenesPorColorJson;
    private String precioPorColorTallaJson;
    private String caracteristicaTitulo;
    private String caracteristicaDescripcion;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public java.math.BigDecimal getPrecio() { return precio; }
    public void setPrecio(java.math.BigDecimal precio) { this.precio = precio; }

    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }

    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public java.math.BigDecimal getPrecioOriginal() { return precioOriginal; }
    public void setPrecioOriginal(java.math.BigDecimal precioOriginal) { this.precioOriginal = precioOriginal; }

    public Boolean getAplicaIva() { return aplicaIva; }
    public void setAplicaIva(Boolean aplicaIva) { this.aplicaIva = aplicaIva; }

    public Categoria getCategoria() { return categoria; }
    public void setCategoria(Categoria categoria) { this.categoria = categoria; }

    public java.util.List<String> getImagenes() { return imagenes; }
    public void setImagenes(java.util.List<String> imagenes) { this.imagenes = imagenes; }

    public java.util.List<String> getTallas() { return tallas; }
    public void setTallas(java.util.List<String> tallas) { this.tallas = tallas; }

    public java.util.List<String> getColores() { return colores; }
    public void setColores(java.util.List<String> colores) { this.colores = colores; }

    public java.util.Map<String, Integer> getStockPorColor() { return stockPorColor; }
    public void setStockPorColor(java.util.Map<String, Integer> stockPorColor) { this.stockPorColor = stockPorColor; }

    public String getStockPorColorTallaJson() { return stockPorColorTallaJson; }
    public void setStockPorColorTallaJson(String stockPorColorTallaJson) { this.stockPorColorTallaJson = stockPorColorTallaJson; }

    public String getImagenesPorColorJson() { return imagenesPorColorJson; }
    public void setImagenesPorColorJson(String imagenesPorColorJson) { this.imagenesPorColorJson = imagenesPorColorJson; }

    public String getPrecioPorColorTallaJson() { return precioPorColorTallaJson; }
    public void setPrecioPorColorTallaJson(String precioPorColorTallaJson) { this.precioPorColorTallaJson = precioPorColorTallaJson; }

    public String getCaracteristicaTitulo() { return caracteristicaTitulo; }
    public void setCaracteristicaTitulo(String caracteristicaTitulo) { this.caracteristicaTitulo = caracteristicaTitulo; }

    public String getCaracteristicaDescripcion() { return caracteristicaDescripcion; }
    public void setCaracteristicaDescripcion(String caracteristicaDescripcion) { this.caracteristicaDescripcion = caracteristicaDescripcion; }
}
