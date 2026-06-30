package com.tiendaropa.backend.service;

import com.tiendaropa.backend.dto.direccion.DireccionDTO;
import com.tiendaropa.backend.dto.direccion.DireccionRequest;
import com.tiendaropa.backend.dto.usuario.UsuarioDTO;
import com.tiendaropa.backend.dto.usuario.UsuarioUpdateRequest;
import com.tiendaropa.backend.entity.Direccion;
import com.tiendaropa.backend.entity.Usuario;
import com.tiendaropa.backend.entity.enums.Rol;
import com.tiendaropa.backend.repository.DireccionRepository;
import com.tiendaropa.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final DireccionRepository direccionRepository;

    public UsuarioDTO obtenerPerfil(Long id) {
        return toDTO(findOrThrow(id));
    }

    @Transactional
    public UsuarioDTO actualizarPerfil(Long id, UsuarioUpdateRequest req) {
        Usuario u = findOrThrow(id);
        u.setNombre(req.getNombre());
        return toDTO(usuarioRepository.save(u));
    }

    public List<DireccionDTO> listarDirecciones(Long usuarioId) {
        return direccionRepository.findByUsuarioId(usuarioId).stream().map(this::toDireccionDTO).toList();
    }

    @Transactional
    public DireccionDTO agregarDireccion(Long usuarioId, DireccionRequest req) {
        Usuario usuario = findOrThrow(usuarioId);
        Direccion d = Direccion.builder()
            .usuario(usuario).calle(req.getCalle()).ciudad(req.getCiudad())
            .provincia(req.getProvincia()).codigoPostal(req.getCodigoPostal())
            .referencias(req.getReferencias()).build();
        return toDireccionDTO(direccionRepository.save(d));
    }

    @Transactional
    public DireccionDTO actualizarDireccion(Long usuarioId, Long direccionId, DireccionRequest req) {
        Direccion d = direccionRepository.findById(direccionId)
            .filter(dir -> dir.getUsuario().getId().equals(usuarioId))
            .orElseThrow(() -> new RuntimeException("Dirección no encontrada"));
        d.setCalle(req.getCalle()); d.setCiudad(req.getCiudad());
        d.setProvincia(req.getProvincia()); d.setCodigoPostal(req.getCodigoPostal());
        d.setReferencias(req.getReferencias());
        return toDireccionDTO(direccionRepository.save(d));
    }

    @Transactional
    public void eliminarDireccion(Long usuarioId, Long direccionId) {
        Direccion d = direccionRepository.findById(direccionId)
            .filter(dir -> dir.getUsuario().getId().equals(usuarioId))
            .orElseThrow(() -> new RuntimeException("Dirección no encontrada"));
        direccionRepository.delete(d);
    }

    // Admin
    public Page<UsuarioDTO> listarTodosPaginado(Pageable pageable) {
        return usuarioRepository.findAll(pageable).map(this::toDTO);
    }

    public List<UsuarioDTO> listarTodos() {
        return usuarioRepository.findAll().stream().map(this::toDTO).toList();
    }

    @Transactional
    public UsuarioDTO cambiarRol(Long id, Rol rol) {
        Usuario u = findOrThrow(id);
        u.setRol(rol);
        return toDTO(usuarioRepository.save(u));
    }

    public UsuarioDTO obtenerPorId(Long id) {
        return toDTO(findOrThrow(id));
    }

    private Usuario findOrThrow(Long id) {
        return usuarioRepository.findById(id).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    public UsuarioDTO toDTO(Usuario u) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(u.getId()); dto.setNombre(u.getNombre());
        dto.setEmail(u.getEmail()); dto.setRol(u.getRol().name());
        return dto;
    }

    private DireccionDTO toDireccionDTO(Direccion d) {
        DireccionDTO dto = new DireccionDTO();
        dto.setId(d.getId()); dto.setCalle(d.getCalle()); dto.setCiudad(d.getCiudad());
        dto.setProvincia(d.getProvincia()); dto.setCodigoPostal(d.getCodigoPostal());
        dto.setReferencias(d.getReferencias());
        return dto;
    }
}
