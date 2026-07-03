package com.tiendaropa.backend.controller;

import com.tiendaropa.backend.entity.Configuracion;
import com.tiendaropa.backend.service.ConfiguracionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ConfiguracionController {

    private final ConfiguracionService service;

    /** Endpoint público: solo devuelve los datos de retiro en tienda */
    @GetMapping("/api/configuracion/retiro")
    public Map<String, String> getRetiro() {
        Map<String, String> map = new java.util.LinkedHashMap<>();
        for (String clave : List.of("retiro_direccion", "retiro_horario", "retiro_whatsapp")) {
            try { map.put(clave, service.get(clave).getValor()); } catch (Exception ignored) {}
        }
        return map;
    }

    @GetMapping("/api/admin/configuracion")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Configuracion> getAll() {
        return service.getAll();
    }

    @PutMapping("/api/admin/configuracion/{clave}")
    @PreAuthorize("hasRole('ADMIN')")
    public Configuracion update(@PathVariable String clave, @RequestBody Map<String, String> body) {
        return service.update(clave, body.get("valor"));
    }
}
