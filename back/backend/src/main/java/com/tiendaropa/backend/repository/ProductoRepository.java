package com.tiendaropa.backend.repository;

import com.tiendaropa.backend.entity.Producto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    @Query("""
        SELECT DISTINCT p FROM Producto p
        LEFT JOIN p.tallas t
        LEFT JOIN p.colores c
        WHERE p.activo = true
          AND (:categoriaId IS NULL OR p.categoria.id = :categoriaId)
          AND (:precioMin IS NULL OR p.precio >= :precioMin)
          AND (:precioMax IS NULL OR p.precio <= :precioMax)
          AND (:nombre IS NULL OR LOWER(p.nombre) LIKE LOWER(CONCAT('%', :nombre, '%')))
          AND (:talla IS NULL OR t = :talla)
          AND (:color IS NULL OR c = :color)
          AND (:genero IS NULL OR p.categoria.genero = :genero)
    """)
    Page<Producto> filtrar(
        @Param("categoriaId") Long categoriaId,
        @Param("precioMin") BigDecimal precioMin,
        @Param("precioMax") BigDecimal precioMax,
        @Param("nombre") String nombre,
        @Param("talla") String talla,
        @Param("color") String color,
        @Param("genero") String genero,
        Pageable pageable
    );

    Page<Producto> findByActivoTrue(Pageable pageable);

    java.util.Optional<Producto> findBySlug(String slug);
    boolean existsBySlug(String slug);
    boolean existsBySku(String sku);

    @Query("SELECT p FROM Producto p WHERE p.activo = true AND p.stock <= :umbral ORDER BY p.stock ASC")
    List<Producto> findByStockBajo(@Param("umbral") int umbral);

    @Query("SELECT p FROM Producto p WHERE p.activo = true ORDER BY p.stock ASC")
    Page<Producto> findAllAdmin(Pageable pageable);

    long countByActivoTrue();
}
