package com.tiendaropa.backend.application.ports.input;

import com.tiendaropa.backend.domain.model.Carrito;

import java.util.List;

public interface CarritoUseCase {
    List<Carrito> listarTodos();
    Carrito obtenerPorId(Long id);
    Carrito crear(Carrito carrito);
    Carrito actualizar(Long id, Carrito carrito);
    void eliminar(Long id);
}
