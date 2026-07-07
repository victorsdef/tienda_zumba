package com.tiendaropa.backend.application.usecases.producto;

import com.tiendaropa.backend.application.ports.input.ProductoUseCase;
import com.tiendaropa.backend.application.ports.output.CategoriaRepositoryPort;
import com.tiendaropa.backend.application.ports.output.ProductoRepositoryPort;
import com.tiendaropa.backend.domain.model.Categoria;
import com.tiendaropa.backend.domain.model.Producto;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Locale;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class ProductoUseCaseImpl implements ProductoUseCase {

    private final ProductoRepositoryPort productoRepositoryPort;
    private final CategoriaRepositoryPort categoriaRepositoryPort;
    private final ObjectMapper objectMapper;

    @Override
    public List<Producto> listarTodos() {
        return productoRepositoryPort.findAll();
    }

    @Override
    public Producto obtenerPorId(Long id) {
        return productoRepositoryPort.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado: " + id));
    }

    @Override
    public Producto crear(Producto producto) {
        Producto p = productoRepositoryPort.save(producto);
        if (p.getSku() == null || p.getSku().isBlank()) {
            p.setSku(crearSkuUnico(p));
        }
        if (p.getSlug() == null || p.getSlug().isBlank()) {
            p.setSlug(crearSlugUnico(p.getNombre(), p.getId()));
        }
        return productoRepositoryPort.save(p);
    }

    @Override
    public Producto actualizar(Long id, Producto producto) {
        Producto p = obtenerPorId(id);
        String nombreAnterior = p.getNombre();
        Long categoriaAnteriorId = p.getCategoria() != null ? p.getCategoria().getId() : null;
        // actualizar campos básicos
        p.setNombre(producto.getNombre());
        p.setDescripcion(producto.getDescripcion());
        p.setPrecio(producto.getPrecio());
        p.setPrecioOriginal(producto.getPrecioOriginal());
        p.setActivo(producto.isActivo());
        p.setAplicaIva(producto.getAplicaIva());
        p.setImagenes(producto.getImagenes());
        p.setTallas(producto.getTallas());
        p.setColores(producto.getColores());
        p.setStockPorColor(producto.getStockPorColor());
        p.setStockPorColorTallaJson(producto.getStockPorColorTallaJson());
        p.setCaracteristicaTitulo(producto.getCaracteristicaTitulo());
        p.setCaracteristicaDescripcion(producto.getCaracteristicaDescripcion());
        if (producto.getCategoria() != null && producto.getCategoria().getId() != null) {
            Categoria cat = categoriaRepositoryPort.findById(producto.getCategoria().getId())
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada"));
            p.setCategoria(cat);
        }

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

        return productoRepositoryPort.save(p);
    }

    @Override
    public void eliminar(Long id) {
        Producto p = obtenerPorId(id);
        p.setActivo(false);
        productoRepositoryPort.save(p);
    }

    // --- Helpers migrated from legacy ProductoService ---

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
        if (!productoRepositoryPort.existsBySlug(base)) return base;
        for (int i = 2; i < 1000; i++) {
            String candidato = base + "-" + i;
            Optional<Producto> existente = productoRepositoryPort.findBySlug(candidato);
            if (existente.isEmpty() || existente.get().getId().equals(idActual)) return candidato;
        }
        return base + "-" + idActual;
    }

    private String crearSkuUnico(Producto producto) {
        String categoria = abreviarCategoria(producto.getCategoria() != null ? producto.getCategoria().getNombre() : null);
        String productoBase = abreviarProducto(producto.getNombre());
        for (int i = 0; i < 50; i++) {
            String sku = categoria + "-" + productoBase + "-" + randomAlfanumerico(4);
            if (!productoRepositoryPort.existsBySku(sku)) {
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
}
