package com.tiendaropa.backend.service;

import com.tiendaropa.backend.dto.producto.ProductoDTO;
import com.tiendaropa.backend.dto.producto.ProductoRequest;
import com.tiendaropa.backend.entity.Categoria;
import com.tiendaropa.backend.entity.Producto;
import com.tiendaropa.backend.repository.CategoriaRepository;
import com.tiendaropa.backend.repository.ItemOrdenRepository;
import com.tiendaropa.backend.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final ItemOrdenRepository itemOrdenRepository;

    public Page<ProductoDTO> filtrar(
        Long categoriaId, BigDecimal precioMin, BigDecimal precioMax,
        String nombre, String talla, String color, String genero, Pageable pageable
    ) {
        return productoRepository.filtrar(categoriaId, precioMin, precioMax, nombre, talla, color, genero, pageable)
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

    public ProductoDTO obtenerPorSlug(String slug) {
        return productoRepository.findBySlug(slug)
            .map(this::toDTO)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + slug));
    }

    /** Genera slugs para productos que aún no tienen uno (migración de datos existentes). */
    @Transactional
    public void generarSlugsExistentes() {
        productoRepository.findAll().forEach(p -> {
            boolean actualizado = false;
            if (p.getSlug() == null || p.getSlug().isBlank()) {
                p.setSlug(crearSlugUnico(p.getNombre(), p.getId()));
                actualizado = true;
            }
            if (p.getSku() == null || p.getSku().isBlank()) {
                p.setSku(crearSkuUnico(p));
                actualizado = true;
            }
            if (actualizado) {
                productoRepository.save(p);
            }
        });
    }

    @Transactional
    public ProductoDTO crear(ProductoRequest req) {
        Producto p = productoRepository.save(toEntity(req, new Producto()));
        p.setSku(crearSkuUnico(p));
        p.setSlug(crearSlugUnico(p.getNombre(), p.getId()));
        return toDTO(productoRepository.save(p));
    }

    @Transactional
    public ProductoDTO actualizar(Long id, ProductoRequest req) {
        Producto p = findOrThrow(id);
        String nombreAnterior = p.getNombre();
        Long categoriaAnteriorId = p.getCategoria() != null ? p.getCategoria().getId() : null;
        p = toEntity(req, p);
        Long categoriaNuevaId = p.getCategoria() != null ? p.getCategoria().getId() : null;
        // Regenerar slug si cambió el nombre
        if (p.getSlug() == null || !p.getSlug().startsWith(slugificar(p.getNombre()))) {
            p.setSlug(crearSlugUnico(p.getNombre(), p.getId()));
        }
        if (p.getSku() == null || p.getSku().isBlank()
            || !java.util.Objects.equals(nombreAnterior, p.getNombre())
            || !java.util.Objects.equals(categoriaAnteriorId, categoriaNuevaId)) {
            p.setSku(crearSkuUnico(p));
        }
        return toDTO(productoRepository.save(p));
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

    /** Trending: productos más vendidos (por unidades en órdenes) */
    public List<ProductoDTO> trending(int limit) {
        List<Object[]> rows = itemOrdenRepository.findTopProductos(PageRequest.of(0, limit));
        List<Long> ids = rows.stream().map(r -> (Long) r[0]).collect(Collectors.toList());
        if (ids.isEmpty()) {
            // Sin datos de ventas: devuelve los más recientes
            return productoRepository.findByActivoTrue(PageRequest.of(0, limit))
                .stream().map(this::toDTO).collect(Collectors.toList());
        }
        return ids.stream()
            .map(id -> productoRepository.findById(id).orElse(null))
            .filter(p -> p != null && p.isActivo())
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    private Producto toEntity(ProductoRequest req, Producto p) {
        p.setNombre(req.getNombre()); p.setDescripcion(req.getDescripcion());
        p.setPrecio(req.getPrecio() != null ? req.getPrecio() : BigDecimal.ZERO);
        p.setPrecioOriginal(req.getPrecioOriginal());
        p.setActivo(req.isActivo());
        if (req.getImagenes() != null) { p.getImagenes().clear(); p.getImagenes().addAll(req.getImagenes()); }
        if (req.getTallas() != null) { p.getTallas().clear(); p.getTallas().addAll(req.getTallas()); }
        if (req.getColores() != null) { p.getColores().clear(); p.getColores().addAll(req.getColores()); }
        if (req.getStockPorColor() != null && !req.getStockPorColor().isEmpty()) {
            p.getStockPorColor().clear();
            p.getStockPorColor().putAll(req.getStockPorColor());
            int total = req.getStockPorColor().values().stream().mapToInt(Integer::intValue).sum();
            p.setStock(total);
        } else {
            p.setStock(req.getStock() != null ? req.getStock() : 0);
        }
        p.setCaracteristicaTitulo(req.getCaracteristicaTitulo());
        p.setCaracteristicaDescripcion(req.getCaracteristicaDescripcion());
        if (req.getCategoriaId() != null) {
            Categoria cat = categoriaRepository.findById(req.getCategoriaId())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
            p.setCategoria(cat);
        }
        return p;
    }

    private String slugificar(String nombre) {
        if (nombre == null) return "producto";
        return nombre.toLowerCase()
            .replaceAll("[áàäâ]", "a").replaceAll("[éèëê]", "e")
            .replaceAll("[íìïî]", "i").replaceAll("[óòöô]", "o")
            .replaceAll("[úùüû]", "u").replaceAll("[ñ]", "n")
            .replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
    }

    private String crearSlugUnico(String nombre, Long idActual) {
        String base = slugificar(nombre);
        if (!productoRepository.existsBySlug(base)) return base;
        // Si hay colisión, prueba base-2, base-3, etc.
        for (int i = 2; i < 1000; i++) {
            String candidato = base + "-" + i;
            // Si el slug ya pertenece al mismo producto, lo reutilizamos
            java.util.Optional<Producto> existente = productoRepository.findBySlug(candidato);
            if (existente.isEmpty() || existente.get().getId().equals(idActual)) return candidato;
        }
        return base + "-" + idActual;
    }

    private String crearSkuUnico(Producto producto) {
        String categoria = abreviarCategoria(producto.getCategoria() != null ? producto.getCategoria().getNombre() : null);
        String productoBase = abreviarProducto(producto.getNombre());
        for (int i = 0; i < 50; i++) {
            String sku = categoria + "-" + productoBase + "-" + randomAlfanumerico(4);
            if (!productoRepository.existsBySku(sku)) {
                return sku;
            }
        }
        throw new IllegalStateException("No se pudo generar un SKU unico");
    }

    private String abreviarCategoria(String nombre) {
        String limpio = limpiarTexto(nombre);
        if (limpio.length() >= 3) {
            return limpio.substring(0, 3);
        }
        return (limpio + "XXX").substring(0, 3);
    }

    private String abreviarProducto(String nombre) {
        String limpio = limpiarTexto(nombre);
        if (limpio.isBlank()) return "PRD";
        String[] partes = limpio.split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String parte : partes) {
            if (!parte.isBlank()) {
                sb.append(parte.charAt(0));
            }
            if (sb.length() == 3) break;
        }
        if (sb.length() < 3) {
            for (int i = 0; i < limpio.length() && sb.length() < 3; i++) {
                sb.append(limpio.charAt(i));
            }
        }
        return sb.substring(0, Math.min(3, sb.length()));
    }

    private String limpiarTexto(String valor) {
        if (valor == null || valor.isBlank()) return "GEN";
        return Normalizer.normalize(valor, Normalizer.Form.NFD)
            .replaceAll("\\p{M}", "")
            .replaceAll("[^A-Za-z0-9 ]", " ")
            .trim()
            .replaceAll("\\s+", " ")
            .toUpperCase(Locale.ROOT);
    }

    private String randomAlfanumerico(int longitud) {
        final String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        StringBuilder sb = new StringBuilder(longitud);
        ThreadLocalRandom random = ThreadLocalRandom.current();
        for (int i = 0; i < longitud; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    public ProductoDTO toDTO(Producto p) {
        ProductoDTO dto = new ProductoDTO();
        dto.setId(p.getId());
        dto.setSku(p.getSku());
        dto.setSlug(p.getSlug());
        dto.setNombre(p.getNombre()); dto.setDescripcion(p.getDescripcion());
        dto.setPrecio(p.getPrecio()); dto.setPrecioOriginal(p.getPrecioOriginal());
        dto.setStock(p.getStock()); dto.setActivo(p.isActivo());
        dto.setImagenes(p.getImagenes()); dto.setTallas(p.getTallas()); dto.setColores(p.getColores());
        dto.setStockPorColor(p.getStockPorColor().isEmpty() ? null : p.getStockPorColor());
        dto.setCaracteristicaTitulo(p.getCaracteristicaTitulo());
        dto.setCaracteristicaDescripcion(p.getCaracteristicaDescripcion());
        if (p.getCategoria() != null) {
            dto.setCategoriaId(p.getCategoria().getId());
            dto.setCategoriaNombre(p.getCategoria().getNombre());
        }
        return dto;
    }
}
