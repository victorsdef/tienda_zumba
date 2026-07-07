package com.tiendaropa.backend.infrastructure.adapters.output.persistence.mapper;

import com.tiendaropa.backend.domain.model.Usuario;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.UsuarioEntity;

public final class UsuarioEntityMapper {
    private UsuarioEntityMapper() {
    }

    public static Usuario toDomain(UsuarioEntity entity) {
        if (entity == null) return null;
        Usuario domain = new Usuario();
        domain.setId(entity.getId());
        domain.setNombre(entity.getNombre());
        domain.setEmail(entity.getEmail());
        domain.setPassword(entity.getPassword());
        domain.setRol(entity.getRol());
        domain.setEmailVerifcado(entity.isEmailVerifcado());
        domain.setActivo(entity.isActivo());
        domain.setTokenVerificacion(entity.getTokenVerificacion());
        return domain;
    }

    public static UsuarioEntity toEntity(Usuario domain) {
        if (domain == null) return null;
        UsuarioEntity entity = new UsuarioEntity();
        entity.setId(domain.getId());
        entity.setNombre(domain.getNombre());
        entity.setEmail(domain.getEmail());
        entity.setPassword(domain.getPassword());
        entity.setRol(domain.getRol());
        entity.setEmailVerifcado(domain.isEmailVerifcado());
        entity.setActivo(domain.isActivo());
        entity.setTokenVerificacion(domain.getTokenVerificacion());
        return entity;
    }
}
