package com.tiendaropa.backend.config;

import com.tiendaropa.backend.entity.Carrito;
import com.tiendaropa.backend.entity.Usuario;
import com.tiendaropa.backend.entity.enums.Rol;
import com.tiendaropa.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Profile("dev")
@RequiredArgsConstructor
public class DataInitializer {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner seedUsers() {
        return args -> {
            if (usuarioRepository.count() > 0) return;

            // ── Admin ──────────────────────────────────────────────
            Usuario admin = new Usuario();
            admin.setNombre("Admin Principal");
            admin.setEmail("admin@modastore.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRol(Rol.ADMIN);
            Carrito carritoAdmin = new Carrito();
            carritoAdmin.setUsuario(admin);
            admin.setCarrito(carritoAdmin);
            usuarioRepository.save(admin);

            // ── Cliente ────────────────────────────────────────────
            Usuario cliente = new Usuario();
            cliente.setNombre("Cliente Demo");
            cliente.setEmail("cliente@modastore.com");
            cliente.setPassword(passwordEncoder.encode("cliente123"));
            cliente.setRol(Rol.CLIENTE);
            Carrito carritoCliente = new Carrito();
            carritoCliente.setUsuario(cliente);
            cliente.setCarrito(carritoCliente);
            usuarioRepository.save(cliente);

            System.out.println("✔ Usuarios seed creados:");
            System.out.println("  ADMIN   → admin@modastore.com   / admin123");
            System.out.println("  CLIENTE → cliente@modastore.com / cliente123");
        };
    }
}
