package com.tiendaropa.backend.infrastructure.adapters.input.rest;

import com.tiendaropa.backend.application.ports.input.AuthUseCase;
import com.tiendaropa.backend.domain.model.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping({"/api/nueva-arquitectura/auth", "/api/auth"})
@RequiredArgsConstructor
public class AuthController {

    private final AuthUseCase authUseCase;

    @PostMapping("/login")
public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> body) {
    Map<String, String> tokens = authUseCase.login(
        body.get("email"),
        body.get("password")
    );

    if (tokens.isEmpty()) return ResponseEntity.status(401).build();
    return ResponseEntity.ok(tokens);
}

   @PostMapping("/register")
    public ResponseEntity<Usuario> register(@RequestBody Usuario usuario) {
    String rawPassword = usuario.getPassword();
    Usuario created = authUseCase.register(usuario, rawPassword);
    return ResponseEntity.ok(created);
}
}
