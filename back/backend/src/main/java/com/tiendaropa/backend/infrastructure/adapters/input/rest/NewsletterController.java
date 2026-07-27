package com.tiendaropa.backend.infrastructure.adapters.input.rest;

import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.NewsletterSubscriberEntity;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.repository.NewsletterSubscriberJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping({"/api/nueva-arquitectura/newsletter", "/api/newsletter"})
@RequiredArgsConstructor
public class NewsletterController {
    private final NewsletterSubscriberJpaRepository repository;

    @PostMapping
    public ResponseEntity<Map<String, String>> subscribe(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "").trim().toLowerCase();
        if (!email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Correo electrónico inválido"));
        }
        if (!repository.existsByEmailIgnoreCase(email)) {
            NewsletterSubscriberEntity subscriber = new NewsletterSubscriberEntity();
            subscriber.setEmail(email);
            repository.save(subscriber);
        }
        return ResponseEntity.ok(Map.of("message", "Suscripción registrada"));
    }
}
