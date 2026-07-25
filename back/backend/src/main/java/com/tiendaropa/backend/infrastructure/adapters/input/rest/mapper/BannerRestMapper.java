package com.tiendaropa.backend.infrastructure.adapters.input.rest.mapper;

import com.tiendaropa.backend.domain.model.Banner;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.banner.BannerDTO;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.banner.BannerRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface BannerRestMapper {

    @Mapping(target = "imagen", source = "imagenUrl")
    BannerDTO toDto(Banner banner);

    List<BannerDTO> toDtoList(List<Banner> banners);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "imagenUrl", source = "imagen")
    Banner toDomain(BannerRequest request);
}
