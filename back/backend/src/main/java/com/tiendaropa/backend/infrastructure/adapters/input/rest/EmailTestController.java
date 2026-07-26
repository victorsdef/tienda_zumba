package com.tiendaropa.backend.infrastructure.adapters.input.rest;

import com.tiendaropa.backend.application.ports.input.EmailUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping({"/api/nueva-arquitectura/admin/test-email", "/api/admin/test-email"})
@RequiredArgsConstructor
public class EmailTestController {

    private final EmailUseCase emailUseCase;

    @GetMapping
    public ResponseEntity<Map<String, String>> testEmail(@RequestParam String destinatario) {
        try {
            emailUseCase.enviarVerificacion(destinatario, "Test", "token-de-prueba-12345");
            return ResponseEntity.ok(Map.of("resultado", "OK - email enviado a " + destinatario));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
