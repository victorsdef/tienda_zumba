package com.tiendaropa.backend.repository;

import com.tiendaropa.backend.entity.ItemOrden;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ItemOrdenRepository extends JpaRepository<ItemOrden, Long> {

    @Query("""
        SELECT i.producto.id, i.nombreProducto, SUM(i.cantidad), SUM(i.cantidad * i.precio)
        FROM ItemOrden i
        WHERE i.producto IS NOT NULL
        GROUP BY i.producto.id, i.nombreProducto
        ORDER BY SUM(i.cantidad) DESC
    """)
    List<Object[]> findTopProductos(org.springframework.data.domain.Pageable pageable);
}
