package com.tiendaropa.backend.infrastructure.adapters.input.rest;

import com.tiendaropa.backend.application.ports.input.ConfiguracionUseCase;
import com.tiendaropa.backend.domain.model.Configuracion;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/nueva-arquitectura/configuracion", "/api/configuracion", "/api/admin/configuracion"})
@RequiredArgsConstructor
public class ConfiguracionController {

    private final ConfiguracionUseCase configUseCase;

    @GetMapping
    public List<Configuracion> all() { return configUseCase.getAll(); }

    @GetMapping("/{clave}")
    public Configuracion get(@PathVariable String clave) { return configUseCase.get(clave); }

    @GetMapping("/map")
    public Map<String,String> map() { return configUseCase.getAllAsMap(); }

    @PostMapping("/{clave}")
    public Configuracion update(@PathVariable String clave, @RequestBody String valor) { return configUseCase.update(clave, valor); }

    @PostMapping("/init/{clave}")
    public void initDefault(@PathVariable String clave, @RequestBody String valor) { configUseCase.initDefault(clave, valor, ""); }

    @GetMapping("/decimal/{clave}")
    public BigDecimal getDecimal(@PathVariable String clave, @RequestParam(required = false) BigDecimal defecto) {
        return configUseCase.getDecimal(clave, defecto);
    }
}
