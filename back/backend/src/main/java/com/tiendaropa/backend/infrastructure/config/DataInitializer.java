package com.tiendaropa.backend.infrastructure.config;

import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import com.tiendaropa.backend.application.ports.output.CategoriaRepositoryPort;
import com.tiendaropa.backend.application.ports.output.ConfiguracionRepositoryPort;
import com.tiendaropa.backend.application.ports.output.PasswordEncoderPort;
import com.tiendaropa.backend.application.ports.output.UsuarioRepositoryPort;
import com.tiendaropa.backend.domain.enums.Rol;
import com.tiendaropa.backend.domain.model.Carrito;
import com.tiendaropa.backend.domain.model.Categoria;
import com.tiendaropa.backend.domain.model.Configuracion;
import com.tiendaropa.backend.domain.model.Usuario;

import lombok.RequiredArgsConstructor;

@Configuration
@Profile("dev")
@RequiredArgsConstructor
public class DataInitializer {

    private final UsuarioRepositoryPort usuarioRepositoryPort;
    private final CategoriaRepositoryPort categoriaRepositoryPort;
    private final ConfiguracionRepositoryPort configuracionRepositoryPort;
    private final PasswordEncoderPort passwordEncoderPort;

    @Bean
    CommandLineRunner seedUsers() {
        return args -> {
            String emailAdmin = "gsofiiazaru@gmail.com";

            if (usuarioRepositoryPort.findByEmail(emailAdmin).isPresent()) {
                return;
            }

            Usuario admin = new Usuario();
            admin.setNombre("Sofia Couture Admin");
            admin.setEmail(emailAdmin);
            admin.setPassword(
                    passwordEncoderPort.encode("24..SofiaZaruma"));
            admin.setRol(Rol.ADMIN);
            admin.setEmailVerificado(true);
            admin.setActivo(true);

            Carrito carritoAdmin = new Carrito();
            carritoAdmin.setUsuario(admin);

            admin.setCarrito(carritoAdmin);

            usuarioRepositoryPort.save(admin);

            System.out.println("✔ Admin creado: " + emailAdmin);
        };
    }

    @Bean
    CommandLineRunner seedCategorias() {
        return args -> {
            if (categoriaRepositoryPort.count() > 0) {
                return;
            }

            // MUJER
            guardarCategoria(
                    "Vestidos",
                    "MUJER",
                    List.of(
                            "XS", "S", "M", "L", "XL", "XXL",
                            "32", "34", "36", "38", "40", "42"));

            guardarCategoria(
                    "Blusas y Tops",
                    "MUJER",
                    List.of("XS", "S", "M", "L", "XL", "XXL"));

            guardarCategoria(
                    "Pantalones y Jeans Mujer",
                    "MUJER",
                    List.of("26", "28", "30", "32", "34", "36", "38", "40"));

            guardarCategoria(
                    "Faldas",
                    "MUJER",
                    List.of("XS", "S", "M", "L", "XL", "XXL"));

            guardarCategoria(
                    "Conjuntos Mujer",
                    "MUJER",
                    List.of("XS", "S", "M", "L", "XL", "XXL"));

            guardarCategoria(
                    "Abrigos y Chaquetas Mujer",
                    "MUJER",
                    List.of("XS", "S", "M", "L", "XL", "XXL", "XXXL"));

            guardarCategoria(
                    "Ropa Interior Mujer",
                    "MUJER",
                    List.of(
                            "XS", "S", "M", "L", "XL", "XXL",
                            "75A", "80B", "80C", "85B", "85C", "90C", "90D"));

            guardarCategoria(
                    "Pijamas y Loungewear",
                    "MUJER",
                    List.of("XS", "S", "M", "L", "XL", "XXL"));

            guardarCategoria(
                    "Activewear Mujer",
                    "MUJER",
                    List.of("XS", "S", "M", "L", "XL", "XXL"));

            guardarCategoria(
                    "Trajes de Baño",
                    "MUJER",
                    List.of(
                            "XS", "S", "M", "L", "XL", "XXL",
                            "32", "34", "36", "38", "40"));

            guardarCategoria(
                    "Maternidad",
                    "MUJER",
                    List.of("XS", "S", "M", "L", "XL", "XXL"));

            // HOMBRE
            guardarCategoria(
                    "Camisas",
                    "HOMBRE",
                    List.of(
                            "XS", "S", "M", "L", "XL", "XXL", "XXXL",
                            "38", "39", "40", "41", "42", "43", "44"));

            guardarCategoria(
                    "Pantalones y Jeans Hombre",
                    "HOMBRE",
                    List.of("28", "30", "32", "34", "36", "38", "40", "42"));

            guardarCategoria(
                    "Abrigos y Chaquetas Hombre",
                    "HOMBRE",
                    List.of("XS", "S", "M", "L", "XL", "XXL", "XXXL"));

            guardarCategoria(
                    "Ropa Interior Hombre",
                    "HOMBRE",
                    List.of("S", "M", "L", "XL", "XXL"));

            guardarCategoria(
                    "Activewear Hombre",
                    "HOMBRE",
                    List.of("XS", "S", "M", "L", "XL", "XXL"));

            guardarCategoria(
                    "Trajes y Formales",
                    "HOMBRE",
                    List.of("38", "40", "42", "44", "46", "48", "50"));

            // NIÑOS
            guardarCategoria(
                    "Bebé (0–24m)",
                    "NINO",
                    List.of(
                            "0-3m", "3-6m", "6-9m",
                            "9-12m", "12-18m", "18-24m"));

            guardarCategoria(
                    "Niña (2–14 años)",
                    "NINO",
                    List.of("2", "4", "6", "8", "10", "12", "14"));

            guardarCategoria(
                    "Niño (2–14 años)",
                    "NINO",
                    List.of("2", "4", "6", "8", "10", "12", "14"));

            // CALZADO
            guardarCategoria(
                    "Zapatos Mujer",
                    "CALZADO",
                    List.of("34", "35", "36", "37", "38", "39", "40", "41"));

            guardarCategoria(
                    "Zapatos Hombre",
                    "CALZADO",
                    List.of(
                            "38", "39", "40", "41", "42",
                            "43", "44", "45", "46"));

            guardarCategoria(
                    "Zapatillas y Sneakers",
                    "CALZADO",
                    List.of(
                            "34", "35", "36", "37", "38", "39", "40",
                            "41", "42", "43", "44", "45", "46"));

            guardarCategoria(
                    "Botas",
                    "CALZADO",
                    List.of(
                            "34", "35", "36", "37", "38",
                            "39", "40", "41", "42", "43", "44"));

            guardarCategoria(
                    "Sandalias",
                    "CALZADO",
                    List.of("34", "35", "36", "37", "38", "39", "40", "41"));

            guardarCategoria(
                    "Calzado Niños",
                    "CALZADO",
                    List.of(
                            "18", "19", "20", "21", "22", "23", "24", "25",
                            "26", "27", "28", "29", "30", "31", "32", "33"));

            // ACCESORIOS
            guardarCategoria(
                    "Bolsos y Carteras",
                    "ACCESORIOS",
                    List.of("Talla única"));

            guardarCategoria(
                    "Joyería y Bisutería",
                    "ACCESORIOS",
                    List.of("6", "7", "8", "9", "10", "Talla única"));

            guardarCategoria(
                    "Cinturones",
                    "ACCESORIOS",
                    List.of(
                            "70", "75", "80", "85", "90",
                            "95", "100", "105", "110"));

            guardarCategoria(
                    "Sombreros y Gorras",
                    "ACCESORIOS",
                    List.of(
                            "54", "56", "57", "58",
                            "59", "60", "61", "Talla única"));

            guardarCategoria(
                    "Bufandas y Pañuelos",
                    "ACCESORIOS",
                    List.of("Talla única"));

            guardarCategoria(
                    "Gafas de Sol",
                    "ACCESORIOS",
                    List.of("Talla única"));

            guardarCategoria(
                    "Relojes",
                    "ACCESORIOS",
                    List.of("38mm", "40mm", "42mm", "44mm"));

            // BELLEZA
            guardarCategoria(
                    "Maquillaje",
                    "BELLEZA",
                    List.of("Talla única"));

            guardarCategoria(
                    "Perfumes",
                    "BELLEZA",
                    List.of("30ml", "50ml", "75ml", "100ml", "150ml", "200ml"));

            guardarCategoria(
                    "Skincare",
                    "BELLEZA",
                    List.of(
                            "15ml", "30ml", "50ml",
                            "75ml", "100ml", "150ml", "200ml"));

            guardarCategoria(
                    "Cabello",
                    "BELLEZA",
                    List.of("200ml", "400ml", "500ml", "Talla única"));

            System.out.println(
                    "✔ Categorías seed: "
                            + categoriaRepositoryPort.count()
                            + " categorías creadas");
        };
    }

    @Bean
    CommandLineRunner seedConfiguracion() {
        return args -> {
            guardarConfiguracion(
                    "comision_payphone",
                    "5.75",
                    "Comisión de Payphone por transacción con tarjeta (%)");

            guardarConfiguracion(
                    "costo_envio",
                    "6.00",
                    "Costo de envío a domicilio (USD)");

            guardarConfiguracion(
                    "costo_envio_cuenca",
                    "3.00",
                    "Costo de envío dentro de Cuenca (USD)");

            guardarConfiguracion(
                    "iva_porcentaje",
                    "15.00",
                    "IVA Ecuador (%)");

            guardarConfiguracion(
                    "ejemplo_con_iva_total",
                    "115.00",
                    "Ejemplo Payphone: total final con IVA incluido");

            guardarConfiguracion(
                    "ejemplo_con_iva_base",
                    "100.00",
                    "Ejemplo Payphone: base gravada con IVA");

            guardarConfiguracion(
                    "ejemplo_sin_iva_total",
                    "200.00",
                    "Ejemplo Payphone: total final sin IVA");

            guardarConfiguracion(
                    "ejemplo_mixto_exento",
                    "200.00",
                    "Ejemplo Payphone: parte exenta en un cobro mixto");

            guardarConfiguracion(
                    "ejemplo_mixto_base",
                    "100.00",
                    "Ejemplo Payphone: base gravada en un cobro mixto");

            guardarConfiguracion(
                    "retiro_direccion",
                    "Av. Solano y Remigio Crespo, local 12, Cuenca",
                    "Dirección del punto de retiro en Cuenca");

            guardarConfiguracion(
                    "retiro_horario",
                    "Lunes a sábado · 9:00 – 18:00",
                    "Horario de atención para retiro en tienda");

            guardarConfiguracion(
                    "retiro_whatsapp",
                    "593984000000",
                    "Número WhatsApp en formato internacional");
        };
    }

    private void guardarCategoria(
            String nombre,
            String genero,
            List<String> tallas) {
        Categoria categoria = new Categoria();

        categoria.setNombre(nombre);
        categoria.setGenero(genero);
        categoria.setActivo("MUJER".equals(genero));
        categoria.setTallasDisponibles(new ArrayList<>(tallas));

        categoriaRepositoryPort.save(categoria);
    }

    private void guardarConfiguracion(
            String clave,
            String valor,
            String descripcion) {
        if (configuracionRepositoryPort.existsById(clave)) {
            return;
        }

        Configuracion configuracion = new Configuracion();
        configuracion.setClave(clave);
        configuracion.setValor(valor);
        configuracion.setDescripcion(descripcion);

        configuracionRepositoryPort.save(configuracion);
    }
}
