package com.tiendaropa.backend.application.ports.input;

import com.tiendaropa.backend.domain.model.Banner;
import java.util.List;
import java.util.Optional;

public interface BannerUseCase {
    Banner crear(Banner banner);
    Optional<Banner> obtener(Long id);
    List<Banner> listarActivos();
    List<Banner> listarTodos();
    Banner actualizar(Banner banner);
    void eliminar(Long id);
}
