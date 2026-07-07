package com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "categorias")
@Getter
@Setter
public class CategoriaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    private String imagen;
    private String genero;

    @ElementCollection
    @CollectionTable(name = "categoria_tallas", joinColumns = @JoinColumn(name = "categoria_id"))
    @Column(name = "talla")
    private List<String> tallasDisponibles = new ArrayList<>();

    @Column(nullable = false)
    private boolean activo = true;
}
