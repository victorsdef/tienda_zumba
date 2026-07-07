package com.tiendaropa.backend.application.usecases.auth;

import com.tiendaropa.backend.application.ports.input.AuthUseCase;
import com.tiendaropa.backend.application.ports.input.UsuarioUseCase;
import com.tiendaropa.backend.application.ports.output.JwtPort;
import com.tiendaropa.backend.domain.enums.Rol;
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
    private final JwtPort jwtPort;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Map<String, String> login(String email, String password) {
        Usuario u = usuarioUseCase.findByEmail(email).orElse(null);
        if (u == null || !passwordEncoder.matches(password, u.getPassword())) {
            return Map.of();
        }
        String token = jwtPort.generateToken(u);
        return new HashMap<>() {{ put("token", token); put("email", u.getEmail()); }};
    }

    @Override
    public Usuario register(Usuario usuario, String rawPassword) {
        usuario.setPassword(passwordEncoder.encode(rawPassword));
        if (usuario.getRol() == null) {
            usuario.setRol(Rol.CLIENTE);
        }
        usuario.setActivo(true);
        return usuarioUseCase.crear(usuario);
    }
}
