package com.tiendaropa.backend.application.usecases.categoria;

import com.tiendaropa.backend.application.ports.input.CategoriaUseCase;
import com.tiendaropa.backend.application.ports.output.CategoriaRepositoryPort;
import com.tiendaropa.backend.domain.model.Categoria;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaUseCaseImpl implements CategoriaUseCase {

    private final CategoriaRepositoryPort categoriaRepositoryPort;

    @Override
    public List<Categoria> listarTodas() {
        return categoriaRepositoryPort.findAll();
    }

    @Override
    public Categoria obtenerPorId(Long id) {
        return categoriaRepositoryPort.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada: " + id));
    }

    @Override
    public Categoria crear(Categoria categoria) {
        return categoriaRepositoryPort.save(categoria);
    }

    @Override
    public Categoria actualizar(Long id, Categoria categoria) {
        Categoria actual = obtenerPorId(id);
        actual.setNombre(categoria.getNombre());
        actual.setDescripcion(categoria.getDescripcion());
        actual.setImagen(categoria.getImagen());
        actual.setGenero(categoria.getGenero());
        actual.setTallasDisponibles(categoria.getTallasDisponibles());
        actual.setActivo(categoria.isActivo());
        return categoriaRepositoryPort.save(actual);
    }

    @Override
    public void eliminar(Long id) {
        obtenerPorId(id);
        categoriaRepositoryPort.deleteById(id);
    }
}
