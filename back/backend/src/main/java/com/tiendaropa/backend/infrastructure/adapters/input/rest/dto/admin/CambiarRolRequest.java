package com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.admin;

import com.tiendaropa.backend.domain.enums.Rol;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CambiarRolRequest {
    @NotNull
    private Rol rol;
}
