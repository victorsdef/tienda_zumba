package com.tiendaropa.backend.application.usecases.configuracion;

import com.tiendaropa.backend.application.ports.input.ConfiguracionUseCase;
import com.tiendaropa.backend.application.ports.output.ConfiguracionRepositoryPort;
import com.tiendaropa.backend.domain.model.Configuracion;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ConfiguracionUseCaseImpl implements ConfiguracionUseCase {

    private final ConfiguracionRepositoryPort repo;

    @Override
    public List<Configuracion> getAll() {
        return repo.findAll();
    }

    @Override
    public Configuracion get(String clave) {
        return repo.findById(clave).orElseThrow(() -> new RuntimeException("Configuración no encontrada: " + clave));
    }

    @Override
    public BigDecimal getDecimal(String clave, BigDecimal defecto) {
        return repo.findById(clave).map(c -> new BigDecimal(c.getValor())).orElse(defecto);
    }

    @Override
    public Configuracion update(String clave, String valor) {
        Configuracion c = repo.findById(clave).orElseThrow(() -> new RuntimeException("Clave no encontrada: " + clave));
        c.setValor(valor);
        return repo.save(c);
    }

    @Override
    public Map<String, String> getAllAsMap() {
        Map<String, String> map = new LinkedHashMap<>();
        repo.findAll().forEach(c -> map.put(c.getClave(), c.getValor()));
        return map;
    }

    @Override
    public void initDefault(String clave, String valor, String descripcion) {
        if (!repo.existsById(clave)) {
            Configuracion c = new Configuracion();
            c.setClave(clave);
            c.setValor(valor);
            c.setDescripcion(descripcion);
            repo.save(c);
        }
    }
}
