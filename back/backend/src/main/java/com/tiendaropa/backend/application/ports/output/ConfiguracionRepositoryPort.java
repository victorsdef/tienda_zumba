package com.tiendaropa.backend.application.ports.output;

import com.tiendaropa.backend.domain.model.Configuracion;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface ConfiguracionRepositoryPort {
    List<Configuracion> findAll();
    Optional<Configuracion> findById(String clave);
    Configuracion save(Configuracion configuracion);
    void deleteById(String clave);
    boolean existsById(String clave);
}
