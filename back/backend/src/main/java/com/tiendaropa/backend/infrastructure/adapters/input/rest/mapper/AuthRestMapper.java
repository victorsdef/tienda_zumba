package com.tiendaropa.backend.infrastructure.adapters.input.rest.mapper;

import com.tiendaropa.backend.domain.model.Usuario;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.auth.AuthResponse;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.auth.RegisterRequest;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.auth.RegisterResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Map;

@Mapper(componentModel = "spring")
public interface AuthRestMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "rol", ignore = true)
    @Mapping(target = "activo", ignore = true)
    @Mapping(target = "emailVerificado", ignore = true)
    @Mapping(target = "tokenVerificacion", ignore = true)
    @Mapping(target = "direcciones", ignore = true)
    @Mapping(target = "carrito", ignore = true)
    Usuario toDomain(RegisterRequest request);

    @Mapping(target = "mensaje", constant = "Cuenta creada correctamente. Ya podés iniciar sesión.")
    @Mapping(target = "rol", expression = "java(usuario.getRol() != null ? usuario.getRol().name() : null)")
    RegisterResponse toRegisterResponse(Usuario usuario);

    @Mapping(target = "accessToken", expression = "java(tokens.get(\"accessToken\") != null ? tokens.get(\"accessToken\") : tokens.get(\"token\"))")
    @Mapping(target = "refreshToken", expression = "java(tokens.get(\"refreshToken\"))")
    @Mapping(target = "tokenType", constant = "Bearer")
    @Mapping(target = "email", expression = "java(tokens.get(\"email\"))")
    @Mapping(target = "nombre", expression = "java(tokens.get(\"nombre\"))")
    @Mapping(target = "rol", expression = "java(tokens.get(\"rol\"))")
    AuthResponse toAuthResponse(Map<String, String> tokens);
}
