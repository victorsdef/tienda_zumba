package com.tiendaropa.backend.application.ports.input;

import com.tiendaropa.backend.domain.model.Configuracion;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface ConfiguracionUseCase {
    List<Configuracion> getAll();
    Configuracion get(String clave);
    java.math.BigDecimal getDecimal(String clave, BigDecimal defecto);
    Configuracion update(String clave, String valor);
    Map<String, String> getAllAsMap();
    void initDefault(String clave, String valor, String descripcion);
}
