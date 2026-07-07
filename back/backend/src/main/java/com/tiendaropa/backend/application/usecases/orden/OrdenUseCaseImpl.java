package com.tiendaropa.backend.application.usecases.orden;

import com.tiendaropa.backend.application.ports.input.OrdenUseCase;
import com.tiendaropa.backend.application.ports.output.OrdenRepositoryPort;
import com.tiendaropa.backend.domain.model.Orden;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrdenUseCaseImpl implements OrdenUseCase {

    private final OrdenRepositoryPort ordenRepository;

    @Override
    public Orden crearOrden(Orden orden) {
        return ordenRepository.save(orden);
    }

    @Override
    public Optional<Orden> obtenerPorId(Long id) {
        return ordenRepository.findById(id);
    }

    @Override
    public List<Orden> listarPorUsuarioId(Long usuarioId) {
        return ordenRepository.findByUsuarioId(usuarioId);
    }

    @Override
    public Orden actualizar(Orden orden) {
        return ordenRepository.update(orden);
    }

    @Override
    public void actualizarEstado(Long id, String estado) {
        Optional<Orden> o = ordenRepository.findById(id);
        if (o.isPresent()) {
            Orden orden = o.get();
            orden.setEstado(estado);
            ordenRepository.update(orden);
        }
    }
}

