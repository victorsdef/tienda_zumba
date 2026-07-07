package com.tiendaropa.backend.application.usecases.direccion;

import com.tiendaropa.backend.application.ports.input.DireccionUseCase;
import com.tiendaropa.backend.application.ports.output.DireccionRepositoryPort;
import com.tiendaropa.backend.domain.model.Direccion;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DireccionUseCaseImpl implements DireccionUseCase {

    private final DireccionRepositoryPort direccionRepositoryPort;

    @Override
    public List<Direccion> listarTodas() {
        return direccionRepositoryPort.findAll();
    }

    @Override
    public Direccion obtenerPorId(Long id) {
        return direccionRepositoryPort.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Direccion no encontrada: " + id));
    }

    @Override
    public Direccion crear(Direccion direccion) {
        return direccionRepositoryPort.save(direccion);
    }

    @Override
    public Direccion actualizar(Long id, Direccion direccion) {
        Direccion actual = obtenerPorId(id);
        actual.setNombreCompleto(direccion.getNombreCompleto());
        actual.setCelular(direccion.getCelular());
        actual.setCedula(direccion.getCedula());
        actual.setProvincia(direccion.getProvincia());
        actual.setCanton(direccion.getCanton());
        actual.setCiudad(direccion.getCiudad());
        actual.setDireccion(direccion.getDireccion());
        actual.setPredeterminada(direccion.isPredeterminada());
        actual.setUsuario(direccion.getUsuario());
        return direccionRepositoryPort.save(actual);
    }

    @Override
    public void eliminar(Long id) {
        obtenerPorId(id);
        direccionRepositoryPort.deleteById(id);
    }
}
