package com.tiendaropa.backend.application.usecases.carrito;

import com.tiendaropa.backend.application.ports.input.CarritoUseCase;
import com.tiendaropa.backend.application.ports.output.CarritoRepositoryPort;
import com.tiendaropa.backend.domain.model.Carrito;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CarritoUseCaseImpl implements CarritoUseCase {

    private final CarritoRepositoryPort carritoRepositoryPort;

    @Override
    public List<Carrito> listarTodos() {
        return carritoRepositoryPort.findAll();
    }

    @Override
    public Carrito obtenerPorId(Long id) {
        return carritoRepositoryPort.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Carrito no encontrado: " + id));
    }

    @Override
    public Carrito crear(Carrito carrito) {
        return carritoRepositoryPort.save(carrito);
    }

    @Override
    public Carrito actualizar(Long id, Carrito carrito) {
        Carrito actual = obtenerPorId(id);
        actual.setItems(carrito.getItems());
        actual.setUsuario(carrito.getUsuario());
        return carritoRepositoryPort.save(actual);
    }

    @Override
    public void eliminar(Long id) {
        obtenerPorId(id);
        carritoRepositoryPort.deleteById(id);
    }
}
