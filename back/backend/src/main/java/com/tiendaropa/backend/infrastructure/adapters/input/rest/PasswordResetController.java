package com.tiendaropa.backend.infrastructure.adapters.input.rest;

import com.tiendaropa.backend.application.ports.input.EmailUseCase;
import com.tiendaropa.backend.application.ports.output.UsuarioRepositoryPort;
import com.tiendaropa.backend.domain.model.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping({"/api/auth", "/api/nueva-arquitectura/auth"})
@RequiredArgsConstructor
public class PasswordResetController {

    private final UsuarioRepositoryPort usuarioRepositoryPort;
    private final EmailUseCase emailUseCase;
    private final PasswordEncoder passwordEncoder;

    // token → {email, expiry}
    private static final Map<String, TokenData> tokens = new ConcurrentHashMap<>();
    private static final long EXPIRY_MS = 30 * 60 * 1000; // 30 min

    record TokenData(String email, Instant expiry) {}

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> solicitarReset(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "Email requerido"));

        Optional<Usuario> usuarioOpt = usuarioRepositoryPort.findByEmail(email.trim().toLowerCase());
        // Siempre responde OK para no revelar si el email existe
        if (usuarioOpt.isPresent()) {
            Usuario u = usuarioOpt.get();
            String token = UUID.randomUUID().toString();
            tokens.put(token, new TokenData(u.getEmail(), Instant.now().plusMillis(EXPIRY_MS)));
            emailUseCase.enviarRecuperacionPassword(u.getEmail(), u.getNombre(), token);
        }
        return ResponseEntity.ok(Map.of("mensaje", "Si el correo existe, recibirás un enlace en breve."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> body) {
        String token    = body.get("token");
        String password = body.get("password");

        if (token == null || token.isBlank() || password == null || password.length() < 6)
            return ResponseEntity.badRequest().body(Map.of("error", "Token o contraseña inválidos"));

        TokenData data = tokens.get(token);
        if (data == null || Instant.now().isAfter(data.expiry()))
            return ResponseEntity.badRequest().body(Map.of("error", "El enlace expiró o es inválido"));

        Optional<Usuario> usuarioOpt = usuarioRepositoryPort.findByEmail(data.email());
        if (usuarioOpt.isEmpty())
            return ResponseEntity.badRequest().body(Map.of("error", "Usuario no encontrado"));

        Usuario u = usuarioOpt.get();
        u.setPassword(passwordEncoder.encode(password));
        usuarioRepositoryPort.save(u);
        tokens.remove(token);

        return ResponseEntity.ok(Map.of("mensaje", "Contraseña actualizada correctamente."));
    }
}
