package com.tiendaropa.backend.service;

import com.tiendaropa.backend.dto.direccion.DireccionDTO;
import com.tiendaropa.backend.dto.direccion.DireccionRequest;
import com.tiendaropa.backend.entity.Direccion;
import com.tiendaropa.backend.entity.Usuario;
import com.tiendaropa.backend.repository.DireccionRepository;
import com.tiendaropa.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DireccionService {

    private final DireccionRepository direccionRepository;
    private final UsuarioRepository usuarioRepository;

    public List<DireccionDTO> listar(Long usuarioId) {
        return direccionRepository.findByUsuarioId(usuarioId).stream().map(this::toDTO).toList();
    }

    @Transactional
    public DireccionDTO crear(Long usuarioId, DireccionRequest req) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (req.isPredeterminada()) quitarPredeterminada(usuarioId);

        // Si es la primera dirección, marcarla como predeterminada
        boolean esPrimera = direccionRepository.findByUsuarioId(usuarioId).isEmpty();

        Direccion d = Direccion.builder()
            .usuario(usuario)
            .nombreCompleto(req.getNombreCompleto())
            .celular(req.getCelular())
            .cedula(req.getCedula())
            .provincia(req.getProvincia())
            .canton(req.getCanton())
            .ciudad(req.getCiudad())
            .direccion(req.getDireccion())
            .predeterminada(req.isPredeterminada() || esPrimera)
            .build();

        return toDTO(direccionRepository.save(d));
    }

    @Transactional
    public DireccionDTO actualizar(Long usuarioId, Long id, DireccionRequest req) {
        Direccion d = findOwned(usuarioId, id);
        if (req.isPredeterminada()) quitarPredeterminada(usuarioId);
        d.setNombreCompleto(req.getNombreCompleto());
        d.setCelular(req.getCelular());
        d.setCedula(req.getCedula());
        d.setProvincia(req.getProvincia());
        d.setCanton(req.getCanton());
        d.setCiudad(req.getCiudad());
        d.setDireccion(req.getDireccion());
        d.setPredeterminada(req.isPredeterminada());
        return toDTO(direccionRepository.save(d));
    }

    @Transactional
    public void eliminar(Long usuarioId, Long id) {
        Direccion d = findOwned(usuarioId, id);
        direccionRepository.delete(d);
    }

    @Transactional
    public DireccionDTO setPredeterminada(Long usuarioId, Long id) {
        quitarPredeterminada(usuarioId);
        Direccion d = findOwned(usuarioId, id);
        d.setPredeterminada(true);
        return toDTO(direccionRepository.save(d));
    }

    private void quitarPredeterminada(Long usuarioId) {
        direccionRepository.findByUsuarioIdAndPredeterminadaTrue(usuarioId).ifPresent(d -> {
            d.setPredeterminada(false);
            direccionRepository.save(d);
        });
    }

    private Direccion findOwned(Long usuarioId, Long id) {
        Direccion d = direccionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Dirección no encontrada"));
        if (!d.getUsuario().getId().equals(usuarioId))
            throw new RuntimeException("No autorizado");
        return d;
    }

    public DireccionDTO toDTO(Direccion d) {
        DireccionDTO dto = new DireccionDTO();
        dto.setId(d.getId());
        dto.setNombreCompleto(d.getNombreCompleto());
        dto.setCelular(d.getCelular());
        dto.setCedula(d.getCedula());
        dto.setProvincia(d.getProvincia());
        dto.setCanton(d.getCanton());
        dto.setCiudad(d.getCiudad());
        dto.setDireccion(d.getDireccion());
        dto.setPredeterminada(d.isPredeterminada());
        return dto;
    }
}
