package com.tiendaropa.backend.infrastructure.adapters.input.rest;

import com.tiendaropa.backend.application.ports.input.ProductoUseCase;
import com.tiendaropa.backend.application.ports.input.CategoriaUseCase;
import com.tiendaropa.backend.application.ports.output.ProductoRepositoryPort;
import com.tiendaropa.backend.domain.model.Producto;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.common.PageResponse;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.producto.ProductoDTO;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.producto.ProductoRequest;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.mapper.ProductoRestMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/nueva-arquitectura/productos", "/api/productos"})
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoUseCase productoUseCase;
    private final ProductoRepositoryPort productoRepositoryPort;
    private final CategoriaUseCase categoriaUseCase;
    private final ProductoRestMapper productoRestMapper;
    private final ObjectMapper objectMapper;

    @GetMapping
    public PageResponse<ProductoDTO> listar(
        @RequestParam(required = false) Long categoriaId,
        @RequestParam(required = false) List<Long> categoriaIds,
        @RequestParam(required = false) String nombre,
        @RequestParam(required = false) String talla,
        @RequestParam(required = false) List<String> tallas,
        @RequestParam(required = false) String color,
        @RequestParam(required = false) List<String> colores,
        @RequestParam(required = false) String genero,
        @RequestParam(required = false) java.math.BigDecimal precioMin,
        @RequestParam(required = false) java.math.BigDecimal precioMax,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "id,desc") String sort
    ) {
        // Normaliza: si viene el singular, lo suma al array
        final List<Long> catIdsIniciales = new java.util.ArrayList<>();
        if (categoriaIds != null) catIdsIniciales.addAll(categoriaIds);
        if (categoriaId != null && !catIdsIniciales.contains(categoriaId)) catIdsIniciales.add(categoriaId);

        // Si se filtra por una categoría padre, incluir también los productos de sus subcategorías
        final java.util.Set<Long> catIds = new java.util.HashSet<>(catIdsIniciales);
        if (!catIdsIniciales.isEmpty()) {
            var todasCats = categoriaUseCase.listarTodas();
            for (Long id : catIdsIniciales) {
                todasCats.stream()
                    .filter(c -> id.equals(c.getCategoriaPadreId()))
                    .forEach(sub -> catIds.add(sub.getId()));
            }
        }

        final List<String> tallasList = new java.util.ArrayList<>();
        if (tallas != null) tallasList.addAll(tallas);
        if (talla != null && !talla.isBlank() && !tallasList.contains(talla)) tallasList.add(talla);

        final List<String> coloresList = new java.util.ArrayList<>();
        if (colores != null) coloresList.addAll(colores);
        if (color != null && !color.isBlank() && !coloresList.contains(color)) coloresList.add(color);

        List<Producto> filtrados = productoUseCase.listarTodos().stream()
            .filter(Producto::isActivo)
            .filter(producto -> catIds.isEmpty() || (producto.getCategoria() != null && catIds.contains(producto.getCategoria().getId())))
            .filter(producto -> nombre == null || nombre.isBlank() || producto.getNombre().toLowerCase(Locale.ROOT).contains(nombre.toLowerCase(Locale.ROOT)))
            .filter(producto -> genero == null || genero.isBlank() || (producto.getCategoria() != null
                && producto.getCategoria().getGenero() != null
                && producto.getCategoria().getGenero().equalsIgnoreCase(genero)))
            .filter(producto -> tallasList.isEmpty() || (producto.getTallas() != null && producto.getTallas().stream().anyMatch(tallasList::contains)))
            .filter(producto -> coloresList.isEmpty() || coloresList.stream().anyMatch(col ->
                (producto.getColores() != null && producto.getColores().contains(col))
                    || (producto.getStockPorColor() != null && producto.getStockPorColor().containsKey(col))
                    || parseStockPorColorTalla(producto).containsKey(col)
            ))
            .filter(producto -> precioMin == null || (producto.getPrecio() != null && producto.getPrecio().compareTo(precioMin) >= 0))
            .filter(producto -> precioMax == null || (producto.getPrecio() != null && producto.getPrecio().compareTo(precioMax) <= 0))
            .sorted(buildComparator(sort))
            .collect(Collectors.toList());

        int safeSize = Math.max(size, 1);
        int safePage = Math.max(page, 0);
        int fromIndex = Math.min(safePage * safeSize, filtrados.size());
        int toIndex = Math.min(fromIndex + safeSize, filtrados.size());
        List<ProductoDTO> content = filtrados.subList(fromIndex, toIndex).stream()
            .map(this::toDto)
            .toList();

        int totalPages = filtrados.isEmpty() ? 0 : (int) Math.ceil((double) filtrados.size() / safeSize);
        return new PageResponse<>(content, totalPages, filtrados.size(), safePage, safeSize);
    }

    @GetMapping("/trending")
    public List<ProductoDTO> trending(@RequestParam(defaultValue = "10") int limit) {
        return productoUseCase.listarTodos().stream()
            .filter(Producto::isActivo)
            .limit(Math.max(limit, 0))
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ProductoDTO obtener(@PathVariable Long id) {
        return toDto(productoUseCase.obtenerPorId(id));
    }

    @GetMapping("/slug/{slug}")
    public ProductoDTO obtenerPorSlug(@PathVariable String slug) {
        Producto producto = productoRepositoryPort.findBySlug(slug)
            .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado: " + slug));
        return toDto(producto);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ProductoDTO crear(@RequestBody ProductoRequest producto) {
        Producto domain = productoRestMapper.toDomain(producto);
        domain.setStockPorColorTallaJson(writeStockPorColorTalla(producto.getStockPorColorTalla()));
        domain.setImagenesPorColorJson(writeImagenesPorColor(producto.getImagenesPorColor()));
        domain.setPrecioPorColorTallaJson(writePrecioPorColorTalla(producto.getPrecioPorColorTalla()));
        return toDto(productoUseCase.crear(domain));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ProductoDTO actualizar(@PathVariable Long id, @RequestBody ProductoRequest producto) {
        Producto domain = productoRestMapper.toDomain(producto);
        domain.setStockPorColorTallaJson(writeStockPorColorTalla(producto.getStockPorColorTalla()));
        domain.setImagenesPorColorJson(writeImagenesPorColor(producto.getImagenesPorColor()));
        domain.setPrecioPorColorTallaJson(writePrecioPorColorTalla(producto.getPrecioPorColorTalla()));
        return toDto(productoUseCase.actualizar(id, domain));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void eliminar(@PathVariable Long id) {
        productoUseCase.eliminar(id);
    }

    private ProductoDTO toDto(Producto producto) {
        ProductoDTO dto = productoRestMapper.toDto(producto);
        dto.setStockPorColorTalla(parseStockPorColorTalla(producto));
        dto.setImagenesPorColor(parseImagenesPorColor(producto));
        dto.setPrecioPorColorTalla(parsePrecioPorColorTalla(producto));
        return dto;
    }

    private Map<String, Map<String, Integer>> parseStockPorColorTalla(Producto producto) {
        if (producto.getStockPorColorTallaJson() == null || producto.getStockPorColorTallaJson().isBlank()) {
            return Collections.emptyMap();
        }
        try {
            return objectMapper.readValue(producto.getStockPorColorTallaJson(), new TypeReference<Map<String, Map<String, Integer>>>() {});
        } catch (Exception ex) {
            return Collections.emptyMap();
        }
    }

    private String writeStockPorColorTalla(Map<String, Map<String, Integer>> stockPorColorTalla) {
        if (stockPorColorTalla == null || stockPorColorTalla.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(stockPorColorTalla);
        } catch (Exception ex) {
            throw new IllegalArgumentException("No se pudo procesar el stock por color y talla", ex);
        }
    }

    private Map<String, List<String>> parseImagenesPorColor(Producto producto) {
        if (producto.getImagenesPorColorJson() == null || producto.getImagenesPorColorJson().isBlank()) {
            return Collections.emptyMap();
        }
        try {
            return objectMapper.readValue(producto.getImagenesPorColorJson(), new TypeReference<Map<String, List<String>>>() {});
        } catch (Exception ex) {
            return Collections.emptyMap();
        }
    }

    private Map<String, Map<String, BigDecimal>> parsePrecioPorColorTalla(Producto producto) {
        if (producto.getPrecioPorColorTallaJson() == null || producto.getPrecioPorColorTallaJson().isBlank()) {
            return Collections.emptyMap();
        }
        try {
            return objectMapper.readValue(producto.getPrecioPorColorTallaJson(), new TypeReference<Map<String, Map<String, BigDecimal>>>() {});
        } catch (Exception ex) {
            return Collections.emptyMap();
        }
    }

    private String writePrecioPorColorTalla(Map<String, Map<String, BigDecimal>> precioPorColorTalla) {
        if (precioPorColorTalla == null || precioPorColorTalla.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(precioPorColorTalla);
        } catch (Exception ex) {
            throw new IllegalArgumentException("No se pudo procesar el precio por color y talla", ex);
        }
    }

    private String writeImagenesPorColor(Map<String, List<String>> imagenesPorColor) {
        if (imagenesPorColor == null || imagenesPorColor.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(imagenesPorColor);
        } catch (Exception ex) {
            throw new IllegalArgumentException("No se pudieron procesar las imágenes por color", ex);
        }
    }

    private Comparator<Producto> buildComparator(String sort) {
        String[] parts = sort == null ? new String[0] : sort.split(",");
        String field = parts.length > 0 ? parts[0].trim().toLowerCase(Locale.ROOT) : "id";
        String direction = parts.length > 1 ? parts[1].trim().toLowerCase(Locale.ROOT) : "desc";

        Comparator<Producto> comparator = switch (field) {
            case "precio" -> Comparator.comparing(Producto::getPrecio, Comparator.nullsLast(Comparator.naturalOrder()));
            case "nombre" -> Comparator.comparing(Producto::getNombre, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
            default -> Comparator.comparing(Producto::getId, Comparator.nullsLast(Comparator.naturalOrder()));
        };

        return "asc".equals(direction) ? comparator : comparator.reversed();
    }
}
