package com.tiendaropa.backend.infrastructure.adapters.input.rest;

import com.tiendaropa.backend.application.ports.input.ConfiguracionUseCase;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.configuracion.ConfiguracionDTO;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.configuracion.ConfiguracionUpdateRequest;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.configuracion.RetiroInfoDTO;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.mapper.ConfiguracionRestMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({
    "/api/nueva-arquitectura/configuracion",
    "/api/configuracion",
    "/api/nueva-arquitectura/admin/configuracion",
    "/api/admin/configuracion"
})
@RequiredArgsConstructor
public class ConfiguracionController {

    private final ConfiguracionUseCase configUseCase;
    private final ConfiguracionRestMapper configuracionRestMapper;

    @GetMapping("/retiro")
    public RetiroInfoDTO getRetiro() {
        Map<String, String> valores = new LinkedHashMap<>();
        for (String clave : List.of(
                "retiro_direccion",
                "retiro_horario",
                "retiro_whatsapp",
                "costo_envio",
                "costo_envio_cuenca"
        )) {
            try {
                ConfiguracionDTO config = configuracionRestMapper.toDto(configUseCase.get(clave));
                valores.put(clave, config.getValor());
            } catch (Exception ignored) {
                valores.putIfAbsent(clave, "");
            }
        }
        return configuracionRestMapper.toRetiroInfoDto(valores);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<ConfiguracionDTO> all() { return configuracionRestMapper.toDtoList(configUseCase.getAll()); }

    @GetMapping("/{clave}")
    @PreAuthorize("hasRole('ADMIN')")
    public ConfiguracionDTO get(@PathVariable String clave) {
        return configuracionRestMapper.toDto(configUseCase.get(clave));
    }

    @GetMapping("/map")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String,String> map() { return configUseCase.getAllAsMap(); }

    @PutMapping("/{clave}")
    @PreAuthorize("hasRole('ADMIN')")
    public ConfiguracionDTO update(@PathVariable String clave, @RequestBody ConfiguracionUpdateRequest request) {
        return configuracionRestMapper.toDto(configUseCase.update(clave, request.getValor()));
    }

    @PostMapping("/init/{clave}")
    @PreAuthorize("hasRole('ADMIN')")
    public void initDefault(@PathVariable String clave, @RequestBody ConfiguracionUpdateRequest request) {
        configUseCase.initDefault(clave, request.getValor(), "");
    }

    @GetMapping("/decimal/{clave}")
    @PreAuthorize("hasRole('ADMIN')")
    public BigDecimal getDecimal(@PathVariable String clave, @RequestParam(required = false) BigDecimal defecto) {
        return configUseCase.getDecimal(clave, defecto);
    }
}
