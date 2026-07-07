package com.tiendaropa.backend.application.ports.input;

import com.tiendaropa.backend.domain.model.Orden;
import java.util.List;
import java.util.Optional;

public interface OrdenUseCase {
    Orden crearOrden(Orden orden);
    Optional<Orden> obtenerPorId(Long id);
    List<Orden> listarPorUsuarioId(Long usuarioId);
    Orden actualizar(Orden orden);
    void actualizarEstado(Long id, String estado);
}

