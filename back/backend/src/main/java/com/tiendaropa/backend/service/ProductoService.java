package com.tiendaropa.backend.service;

import com.tiendaropa.backend.dto.producto.ProductoDTO;
import com.tiendaropa.backend.dto.producto.ProductoRequest;
import com.tiendaropa.backend.entity.Categoria;
import com.tiendaropa.backend.entity.Producto;
import com.tiendaropa.backend.repository.CategoriaRepository;
import com.tiendaropa.backend.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;

    public Page<ProductoDTO> filtrar(
        Long categoriaId, BigDecimal precioMin, BigDecimal precioMax,
        String nombre, String talla, String color, Pageable pageable
    ) {
        return productoRepository.filtrar(categoriaId, precioMin, precioMax, nombre, talla, color, pageable)
            .map(this::toDTO);
    }

    public Page<ProductoDTO> listar(Pageable pageable) {
        return productoRepository.findByActivoTrue(pageable).map(this::toDTO);
    }

    /** Para admin: incluye todos (activos e inactivos) */
    public Page<ProductoDTO> listarAdmin(Pageable pageable) {
        return productoRepository.findAll(pageable).map(this::toDTO);
    }

    public ProductoDTO obtener(Long id) {
        return toDTO(findOrThrow(id));
    }

    @Transactional
    public ProductoDTO crear(ProductoRequest req) {
        return toDTO(productoRepository.save(toEntity(req, new Producto())));
    }

    @Transactional
    public ProductoDTO actualizar(Long id, ProductoRequest req) {
        return toDTO(productoRepository.save(toEntity(req, findOrThrow(id))));
    }

    @Transactional
    public void eliminar(Long id) {
        Producto p = findOrThrow(id);
        p.setActivo(false);
        productoRepository.save(p);
    }

    @Transactional
    public ProductoDTO toggleActivo(Long id) {
        Producto p = findOrThrow(id);
        p.setActivo(!p.isActivo());
        return toDTO(productoRepository.save(p));
    }

    @Transactional
    public ProductoDTO actualizarStock(Long id, int nuevoStock) {
        Producto p = findOrThrow(id);
        p.setStock(nuevoStock);
        return toDTO(productoRepository.save(p));
    }

    private Producto findOrThrow(Long id) {
        return productoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + id));
    }

    private Producto toEntity(ProductoRequest req, Producto p) {
        p.setNombre(req.getNombre()); p.setDescripcion(req.getDescripcion());
        p.setPrecio(req.getPrecio()); p.setPrecioOriginal(req.getPrecioOriginal());
        p.setStock(req.getStock()); p.setActivo(true);
        if (req.getImagenes() != null) { p.getImagenes().clear(); p.getImagenes().addAll(req.getImagenes()); }
        if (req.getTallas() != null) { p.getTallas().clear(); p.getTallas().addAll(req.getTallas()); }
        if (req.getColores() != null) { p.getColores().clear(); p.getColores().addAll(req.getColores()); }
        if (req.getCategoriaId() != null) {
            Categoria cat = categoriaRepository.findById(req.getCategoriaId())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
            p.setCategoria(cat);
        }
        return p;
    }

    public ProductoDTO toDTO(Producto p) {
        ProductoDTO dto = new ProductoDTO();
        dto.setId(p.getId()); dto.setNombre(p.getNombre()); dto.setDescripcion(p.getDescripcion());
        dto.setPrecio(p.getPrecio()); dto.setPrecioOriginal(p.getPrecioOriginal());
        dto.setStock(p.getStock()); dto.setActivo(p.isActivo());
        dto.setImagenes(p.getImagenes()); dto.setTallas(p.getTallas()); dto.setColores(p.getColores());
        if (p.getCategoria() != null) {
            dto.setCategoriaId(p.getCategoria().getId());
            dto.setCategoriaNombre(p.getCategoria().getNombre());
        }
        return dto;
    }
}
