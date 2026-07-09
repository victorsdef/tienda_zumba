package com.tiendaropa.backend.infrastructure.adapters.input.rest.mapper;

import com.tiendaropa.backend.domain.model.Banner;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.banner.BannerDTO;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.banner.BannerRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface BannerRestMapper {

    @Mapping(target = "tag", ignore = true)
    @Mapping(target = "subtitulo", ignore = true)
    @Mapping(target = "ctaTexto", ignore = true)
    @Mapping(target = "tipoDestino", ignore = true)
    @Mapping(target = "destinoValor", source = "enlace")
    @Mapping(target = "colorDesde", ignore = true)
    @Mapping(target = "colorHasta", ignore = true)
    @Mapping(target = "imagen", source = "imagenUrl")
    BannerDTO toDto(Banner banner);

    List<BannerDTO> toDtoList(List<Banner> banners);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "imagenUrl", source = "imagen")
    @Mapping(target = "enlace", source = "destinoValor")
    @Mapping(target = "fechaInicio", ignore = true)
    @Mapping(target = "fechaFin", ignore = true)
    Banner toDomain(BannerRequest request);
}
