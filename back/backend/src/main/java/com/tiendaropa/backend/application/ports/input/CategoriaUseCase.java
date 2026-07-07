package com.tiendaropa.backend.application.ports.input;

import com.tiendaropa.backend.domain.model.Categoria;

import java.util.List;

public interface CategoriaUseCase {
    List<Categoria> listarTodas();
    Categoria obtenerPorId(Long id);
    Categoria crear(Categoria categoria);
    Categoria actualizar(Long id, Categoria categoria);
    void eliminar(Long id);
}
