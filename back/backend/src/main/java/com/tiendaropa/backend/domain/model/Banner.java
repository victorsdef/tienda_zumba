package com.tiendaropa.backend.domain.model;

public class Banner {
    private Long id;
    private String tag;
    private String titulo;
    private String subtitulo;
    private String ctaTexto;
    private String tipoDestino;
    private String destinoValor;
    private String colorDesde;
    private String colorHasta;
    private String imagenUrl;
    private Integer orden;
    private boolean activo;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTag() { return tag; }
    public void setTag(String tag) { this.tag = tag; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getSubtitulo() { return subtitulo; }
    public void setSubtitulo(String subtitulo) { this.subtitulo = subtitulo; }
    public String getCtaTexto() { return ctaTexto; }
    public void setCtaTexto(String ctaTexto) { this.ctaTexto = ctaTexto; }
    public String getTipoDestino() { return tipoDestino; }
    public void setTipoDestino(String tipoDestino) { this.tipoDestino = tipoDestino; }
    public String getDestinoValor() { return destinoValor; }
    public void setDestinoValor(String destinoValor) { this.destinoValor = destinoValor; }
    public String getColorDesde() { return colorDesde; }
    public void setColorDesde(String colorDesde) { this.colorDesde = colorDesde; }
    public String getColorHasta() { return colorHasta; }
    public void setColorHasta(String colorHasta) { this.colorHasta = colorHasta; }
    public String getImagenUrl() { return imagenUrl; }
    public void setImagenUrl(String imagenUrl) { this.imagenUrl = imagenUrl; }
    public Integer getOrden() { return orden; }
    public void setOrden(Integer orden) { this.orden = orden; }
    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }
}
