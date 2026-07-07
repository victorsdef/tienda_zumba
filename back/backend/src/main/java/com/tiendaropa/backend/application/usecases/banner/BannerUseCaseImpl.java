package com.tiendaropa.backend.application.usecases.banner;

import com.tiendaropa.backend.application.ports.input.BannerUseCase;
import com.tiendaropa.backend.application.ports.output.BannerRepositoryPort;
import com.tiendaropa.backend.domain.model.Banner;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BannerUseCaseImpl implements BannerUseCase {

    private final BannerRepositoryPort bannerRepository;

    @Override
    public Banner crear(Banner banner) { return bannerRepository.save(banner); }

    @Override
    public Optional<Banner> obtener(Long id) { return bannerRepository.findById(id); }

    @Override
    public List<Banner> listarActivos() { return bannerRepository.findActivos(); }

    @Override
    public Banner actualizar(Banner banner) { return bannerRepository.update(banner); }

    @Override
    public void eliminar(Long id) { bannerRepository.deleteById(id); }
}
