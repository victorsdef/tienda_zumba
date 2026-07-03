package com.tiendaropa.backend.service;

import com.tiendaropa.backend.entity.Configuracion;
import com.tiendaropa.backend.repository.ConfiguracionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ConfiguracionService {

    private final ConfiguracionRepository repo;

    public List<Configuracion> getAll() {
        return repo.findAll();
    }

    public Configuracion get(String clave) {
        return repo.findById(clave)
            .orElseThrow(() -> new RuntimeException("Configuración no encontrada: " + clave));
    }

    public BigDecimal getDecimal(String clave, BigDecimal defecto) {
        return repo.findById(clave)
            .map(c -> new BigDecimal(c.getValor()))
            .orElse(defecto);
    }

    public Configuracion update(String clave, String valor) {
        Configuracion c = repo.findById(clave)
            .orElseThrow(() -> new RuntimeException("Clave no encontrada: " + clave));
        c.setValor(valor);
        return repo.save(c);
    }

    public Map<String, String> getAllAsMap() {
        Map<String, String> map = new java.util.LinkedHashMap<>();
        repo.findAll().forEach(c -> map.put(c.getClave(), c.getValor()));
        return map;
    }

    public void initDefault(String clave, String valor, String descripcion) {
        if (!repo.existsById(clave)) {
            repo.save(Configuracion.builder()
                .clave(clave).valor(valor).descripcion(descripcion).build());
        }
    }
}
