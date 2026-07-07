package com.tiendaropa.backend.application.ports.input;

import com.tiendaropa.backend.domain.model.Producto;

import java.util.List;

public interface ProductoUseCase {
    List<Producto> listarTodos();
    Producto obtenerPorId(Long id);
    Producto crear(Producto producto);
    Producto actualizar(Long id, Producto producto);
    void eliminar(Long id);
}
