package com.tiendaropa.backend.service;

import com.tiendaropa.backend.dto.banner.BannerDTO;
import com.tiendaropa.backend.dto.banner.BannerRequest;
import com.tiendaropa.backend.entity.Banner;
import com.tiendaropa.backend.repository.BannerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BannerService {

    private final BannerRepository bannerRepository;

    public List<BannerDTO> listarActivos() {
        return bannerRepository.findByActivoTrueOrderByOrdenAsc()
            .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<BannerDTO> listarTodos() {
        return bannerRepository.findAllByOrderByOrdenAsc()
            .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public BannerDTO crear(BannerRequest req) {
        return toDTO(bannerRepository.save(toEntity(req, new Banner())));
    }

    @Transactional
    public BannerDTO actualizar(Long id, BannerRequest req) {
        Banner b = bannerRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Banner no encontrado: " + id));
        return toDTO(bannerRepository.save(toEntity(req, b)));
    }

    @Transactional
    public void eliminar(Long id) {
        bannerRepository.deleteById(id);
    }

    @Transactional
    public BannerDTO toggleActivo(Long id) {
        Banner b = bannerRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Banner no encontrado: " + id));
        b.setActivo(!b.isActivo());
        return toDTO(bannerRepository.save(b));
    }

    private Banner toEntity(BannerRequest req, Banner b) {
        b.setTag(req.getTag());
        b.setTitulo(req.getTitulo());
        b.setSubtitulo(req.getSubtitulo());
        b.setCtaTexto(req.getCtaTexto());
        b.setTipoDestino(req.getTipoDestino());
        b.setDestinoValor(req.getDestinoValor());
        b.setColorDesde(req.getColorDesde() != null ? req.getColorDesde() : "#7d5c48");
        b.setColorHasta(req.getColorHasta() != null ? req.getColorHasta() : "#9c7a62");
        b.setImagen(req.getImagen());
        b.setOrden(req.getOrden());
        b.setActivo(req.isActivo());
        return b;
    }

    private BannerDTO toDTO(Banner b) {
        BannerDTO dto = new BannerDTO();
        dto.setId(b.getId());
        dto.setTag(b.getTag());
        dto.setTitulo(b.getTitulo());
        dto.setSubtitulo(b.getSubtitulo());
        dto.setCtaTexto(b.getCtaTexto());
        dto.setTipoDestino(b.getTipoDestino());
        dto.setDestinoValor(b.getDestinoValor());
        dto.setColorDesde(b.getColorDesde());
        dto.setColorHasta(b.getColorHasta());
        dto.setImagen(b.getImagen());
        dto.setOrden(b.getOrden());
        dto.setActivo(b.isActivo());
        return dto;
    }
}
