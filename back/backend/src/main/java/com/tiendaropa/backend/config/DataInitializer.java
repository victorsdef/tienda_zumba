package com.tiendaropa.backend.config;

import com.tiendaropa.backend.entity.Carrito;
import com.tiendaropa.backend.entity.Categoria;
import com.tiendaropa.backend.entity.Usuario;
import com.tiendaropa.backend.entity.enums.Rol;
import com.tiendaropa.backend.repository.CategoriaRepository;
import com.tiendaropa.backend.repository.UsuarioRepository;
import com.tiendaropa.backend.service.ConfiguracionService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Configuration
@Profile("dev")
@RequiredArgsConstructor
public class DataInitializer {

    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;
    private final PasswordEncoder passwordEncoder;
    private final ConfiguracionService configuracionService;

    @Bean
    CommandLineRunner seedUsers() {
        return args -> {
            if (usuarioRepository.findByEmail("gsofiiazaru@gmail.com").isPresent()) return;

            Usuario admin = new Usuario();
            admin.setNombre("Sofia Couture Admin");
            admin.setEmail("gsofiiazaru@gmail.com");
            admin.setPassword(passwordEncoder.encode("24..SofiaZaruma"));
            admin.setRol(Rol.ADMIN);
            admin.setEmailVerificado(true);
            Carrito carritoAdmin = new Carrito();
            carritoAdmin.setUsuario(admin);
            admin.setCarrito(carritoAdmin);
            usuarioRepository.save(admin);

            System.out.println("✔ Admin creado: gsofiiazaru@gmail.com");
        };
    }

    @Bean
    CommandLineRunner seedCategorias() {
        return args -> {
            if (categoriaRepository.count() > 0) return;

            // ── MUJER ──────────────────────────────────────────────
            guardar("Vestidos",               "MUJER", List.of("XS","S","M","L","XL","XXL","32","34","36","38","40","42"));
            guardar("Blusas y Tops",          "MUJER", List.of("XS","S","M","L","XL","XXL"));
            guardar("Pantalones y Jeans Mujer","MUJER", List.of("26","28","30","32","34","36","38","40"));
            guardar("Faldas",                 "MUJER", List.of("XS","S","M","L","XL","XXL"));
            guardar("Conjuntos Mujer",        "MUJER", List.of("XS","S","M","L","XL","XXL"));
            guardar("Abrigos y Chaquetas Mujer","MUJER",List.of("XS","S","M","L","XL","XXL","XXXL"));
            guardar("Ropa Interior Mujer",    "MUJER", List.of("XS","S","M","L","XL","XXL","75A","80B","80C","85B","85C","90C","90D"));
            guardar("Pijamas y Loungewear",   "MUJER", List.of("XS","S","M","L","XL","XXL"));
            guardar("Activewear Mujer",       "MUJER", List.of("XS","S","M","L","XL","XXL"));
            guardar("Trajes de Baño",         "MUJER", List.of("XS","S","M","L","XL","XXL","32","34","36","38","40"));
            guardar("Maternidad",             "MUJER", List.of("XS","S","M","L","XL","XXL"));

            // ── HOMBRE ─────────────────────────────────────────────
            guardar("Camisas",                "HOMBRE", List.of("XS","S","M","L","XL","XXL","XXXL","38","39","40","41","42","43","44"));
            guardar("Pantalones y Jeans Hombre","HOMBRE",List.of("28","30","32","34","36","38","40","42"));
            guardar("Abrigos y Chaquetas Hombre","HOMBRE",List.of("XS","S","M","L","XL","XXL","XXXL"));
            guardar("Ropa Interior Hombre",   "HOMBRE", List.of("S","M","L","XL","XXL"));
            guardar("Activewear Hombre",      "HOMBRE", List.of("XS","S","M","L","XL","XXL"));
            guardar("Trajes y Formales",      "HOMBRE", List.of("38","40","42","44","46","48","50"));

            // ── NIÑOS ──────────────────────────────────────────────
            guardar("Bebé (0–24m)",           "NINO", List.of("0-3m","3-6m","6-9m","9-12m","12-18m","18-24m"));
            guardar("Niña (2–14 años)",       "NINO", List.of("2","4","6","8","10","12","14"));
            guardar("Niño (2–14 años)",       "NINO", List.of("2","4","6","8","10","12","14"));

            // ── CALZADO ────────────────────────────────────────────
            guardar("Zapatos Mujer",          "CALZADO", List.of("34","35","36","37","38","39","40","41"));
            guardar("Zapatos Hombre",         "CALZADO", List.of("38","39","40","41","42","43","44","45","46"));
            guardar("Zapatillas y Sneakers",  "CALZADO", List.of("34","35","36","37","38","39","40","41","42","43","44","45","46"));
            guardar("Botas",                  "CALZADO", List.of("34","35","36","37","38","39","40","41","42","43","44"));
            guardar("Sandalias",              "CALZADO", List.of("34","35","36","37","38","39","40","41"));
            guardar("Calzado Niños",          "CALZADO", List.of("18","19","20","21","22","23","24","25","26","27","28","29","30","31","32","33"));

            // ── ACCESORIOS ─────────────────────────────────────────
            guardar("Bolsos y Carteras",      "ACCESORIOS", List.of("Talla única"));
            guardar("Joyería y Bisutería",    "ACCESORIOS", List.of("6","7","8","9","10","Talla única"));
            guardar("Cinturones",             "ACCESORIOS", List.of("70","75","80","85","90","95","100","105","110"));
            guardar("Sombreros y Gorras",     "ACCESORIOS", List.of("54","56","57","58","59","60","61","Talla única"));
            guardar("Bufandas y Pañuelos",    "ACCESORIOS", List.of("Talla única"));
            guardar("Gafas de Sol",           "ACCESORIOS", List.of("Talla única"));
            guardar("Relojes",                "ACCESORIOS", List.of("38mm","40mm","42mm","44mm"));

            // ── BELLEZA ────────────────────────────────────────────
            guardar("Maquillaje",             "BELLEZA", List.of("Talla única"));
            guardar("Perfumes",               "BELLEZA", List.of("30ml","50ml","75ml","100ml","150ml","200ml"));
            guardar("Skincare",               "BELLEZA", List.of("15ml","30ml","50ml","75ml","100ml","150ml","200ml"));
            guardar("Cabello",                "BELLEZA", List.of("200ml","400ml","500ml","Talla única"));

            System.out.println("✔ Categorías seed: " + categoriaRepository.count() + " categorías creadas");
        };
    }

    @Bean
    CommandLineRunner seedConfiguracion() {
        return args -> {
            configuracionService.initDefault("comision_payphone", "5.75",
                "Comisión de Payphone por transacción con tarjeta (%)");
            configuracionService.initDefault("costo_envio", "6.00",
                "Costo de envío a domicilio (USD)");
            configuracionService.initDefault("iva_porcentaje", "15.00",
                "IVA Ecuador (%) — referencia para calcular precios con impuesto incluido");
            configuracionService.initDefault("retiro_direccion", "Av. Solano y Remigio Crespo, local 12, Cuenca",
                "Dirección del punto de retiro en Cuenca");
            configuracionService.initDefault("retiro_horario", "Lunes a sábado · 9:00 – 18:00",
                "Horario de atención para retiro en tienda");
            configuracionService.initDefault("retiro_whatsapp", "593984000000",
                "Número WhatsApp para coordinar retiro (formato internacional sin + ni espacios)");
        };
    }

    private void guardar(String nombre, String genero, List<String> tallas) {
        Categoria c = new Categoria();
        c.setNombre(nombre);
        c.setGenero(genero);
        c.getTallasDisponibles().addAll(tallas);
        categoriaRepository.save(c);
    }
}
