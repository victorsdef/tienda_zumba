package com.tiendaropa.backend.application.ports.input;

import com.tiendaropa.backend.domain.model.Direccion;

import java.util.List;

public interface DireccionUseCase {
    List<Direccion> listarTodas();
    Direccion obtenerPorId(Long id);
    Direccion crear(Direccion direccion);
    Direccion actualizar(Long id, Direccion direccion);
    void eliminar(Long id);
}
