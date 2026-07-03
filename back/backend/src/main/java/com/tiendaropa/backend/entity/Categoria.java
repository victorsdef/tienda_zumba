package com.tiendaropa.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "categorias")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nombre;

    private String descripcion;

    private String imagen;

    private String genero; // MUJER | HOMBRE | NINO | CALZADO | ACCESORIOS | BELLEZA

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "categoria_tallas", joinColumns = @JoinColumn(name = "categoria_id"))
    @Column(name = "talla")
    @Builder.Default
    private List<String> tallasDisponibles = new ArrayList<>();

    @Builder.Default
    @Column(nullable = false)
    private boolean activo = true;
}
