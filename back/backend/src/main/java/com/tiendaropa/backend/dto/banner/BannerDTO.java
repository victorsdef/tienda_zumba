package com.tiendaropa.backend.dto.banner;

import lombok.Data;

@Data
public class BannerDTO {
    private Long id;
    private String tag;
    private String titulo;
    private String subtitulo;
    private String ctaTexto;
    private String tipoDestino;
    private String destinoValor;
    private String colorDesde;
    private String colorHasta;
    private String imagen;
    private int orden;
    private boolean activo;
}
