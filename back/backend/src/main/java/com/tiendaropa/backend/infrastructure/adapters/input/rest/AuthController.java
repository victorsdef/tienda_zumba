package com.tiendaropa.backend.infrastructure.adapters.input.rest;

import com.tiendaropa.backend.application.ports.input.AuthUseCase;
import com.tiendaropa.backend.application.usecases.auth.AuthUseCaseImpl;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.auth.AuthResponse;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.auth.LoginRequest;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.auth.RefreshTokenRequest;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.auth.RegisterRequest;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.auth.RegisterResponse;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.mapper.AuthRestMapper;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping({ "/api/nueva-arquitectura/auth", "/api/auth" })
@RequiredArgsConstructor
public class AuthController {

    private final AuthUseCase authUseCase;
    private final AuthUseCaseImpl authUseCaseImpl;
    private final AuthRestMapper authRestMapper;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {

        Map<String, String> tokens = authUseCase.login(
                request.getEmail(),
                request.getPassword());

        if (tokens.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(authRestMapper.toAuthResponse(tokens));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody RefreshTokenRequest request) {
        var tokens = authUseCase.refresh(request.getRefreshToken());
        if (tokens.isEmpty()) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(authRestMapper.toAuthResponse(tokens));
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@RequestBody RegisterRequest request) {
        var created = authUseCase.register(authRestMapper.toDomain(request), request.getPassword());
        return ResponseEntity.ok(authRestMapper.toRegisterResponse(created));
    }

    @PostMapping("/verificar-email")
    public ResponseEntity<Map<String, String>> verificarEmail(@RequestParam String token) {
        boolean ok = authUseCaseImpl.verificarEmail(token);
        if (ok) return ResponseEntity.ok(Map.of("mensaje", "Email verificado correctamente"));
        return ResponseEntity.badRequest().body(Map.of("error", "Token inválido o ya utilizado"));
    }
}
