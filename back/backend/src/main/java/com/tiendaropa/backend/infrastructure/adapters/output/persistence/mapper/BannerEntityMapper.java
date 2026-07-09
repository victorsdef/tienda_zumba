package com.tiendaropa.backend.infrastructure.adapters.output.persistence.mapper;

import com.tiendaropa.backend.domain.model.Banner;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.BannerEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface BannerEntityMapper {

    Banner toDomain(BannerEntity entity);

    BannerEntity toEntity(Banner domain);
}
