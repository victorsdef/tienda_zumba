package com.tiendaropa.backend.dto.admin;

import com.tiendaropa.backend.entity.enums.Rol;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CambiarRolRequest {
    @NotNull
    private Rol rol;
}
