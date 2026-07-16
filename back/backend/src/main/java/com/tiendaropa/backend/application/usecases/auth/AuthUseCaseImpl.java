package com.tiendaropa.backend.application.usecases.auth;

import com.tiendaropa.backend.application.ports.input.AuthUseCase;
import com.tiendaropa.backend.application.ports.input.UsuarioUseCase;
import com.tiendaropa.backend.application.ports.output.CarritoRepositoryPort;
import com.tiendaropa.backend.application.ports.output.JwtPort;
import com.tiendaropa.backend.domain.enums.Rol;
import com.tiendaropa.backend.domain.model.Carrito;
import com.tiendaropa.backend.domain.model.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthUseCaseImpl implements AuthUseCase {

    private final UsuarioUseCase usuarioUseCase;
    private final CarritoRepositoryPort carritoRepositoryPort;
    private final JwtPort jwtPort;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Map<String, String> login(String email, String password) {
        Usuario u = usuarioUseCase.findByEmail(email).orElse(null);
        if (u == null || !passwordEncoder.matches(password, u.getPassword())) {
            return Map.of();
        }
        if (!u.isActivo() || !u.isEmailVerificado()) {
            return Map.of();
        }

        Map<String, String> response = new HashMap<>();
        response.put("accessToken", jwtPort.generateToken(u));
        response.put("refreshToken", jwtPort.generateRefreshToken(u));
        response.put("token", response.get("accessToken"));
        response.put("email", u.getEmail());
        response.put("nombre", u.getNombre());
        response.put("rol", u.getRol() != null ? u.getRol().name() : null);
        return response;
    }

    @Override
    public Map<String, String> refresh(String refreshToken) {
        try {
            String email = jwtPort.extractUsername(refreshToken);
            if (email == null) return Map.of();
            Usuario u = usuarioUseCase.findByEmail(email).orElse(null);
            if (u == null || !u.isActivo() || !jwtPort.isTokenValid(refreshToken, email)) return Map.of();
            Map<String, String> response = new HashMap<>();
            response.put("accessToken", jwtPort.generateToken(u));
            response.put("refreshToken", jwtPort.generateRefreshToken(u));
            response.put("email", u.getEmail());
            response.put("nombre", u.getNombre());
            response.put("rol", u.getRol() != null ? u.getRol().name() : null);
            return response;
        } catch (Exception e) {
            return Map.of();
        }
    }

    @Override
    public Usuario register(Usuario usuario, String rawPassword) {
        if (usuarioUseCase.findByEmail(usuario.getEmail()).isPresent()) {
            throw new IllegalArgumentException("El email ya está registrado");
        }

        usuario.setPassword(passwordEncoder.encode(rawPassword));
        usuario.setRol(Rol.CLIENTE);
        usuario.setEmailVerificado(true);
        usuario.setActivo(true);
        usuario.setTokenVerificacion(null);

        Usuario created = usuarioUseCase.crear(usuario);

        Carrito carrito = new Carrito();
        carrito.setUsuario(created);
        carritoRepositoryPort.save(carrito);

        return created;
    }
}
