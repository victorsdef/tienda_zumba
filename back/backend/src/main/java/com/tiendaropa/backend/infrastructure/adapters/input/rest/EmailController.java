package com.tiendaropa.backend.infrastructure.adapters.input.rest;

import com.tiendaropa.backend.application.ports.input.EmailUseCase;
import com.tiendaropa.backend.domain.model.Orden;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/nueva-arquitectura/email", "/api/email"})
@RequiredArgsConstructor
public class EmailController {

    private final EmailUseCase emailUseCase;

    @PostMapping("/verificacion")
    @PreAuthorize("hasRole('ADMIN')")
    public void verificacion(@RequestParam String to, @RequestParam String nombre, @RequestParam String token) {
        emailUseCase.enviarVerificacion(to, nombre, token);
    }

    @PostMapping("/bienvenida")
    @PreAuthorize("hasRole('ADMIN')")
    public void bienvenida(@RequestParam String to, @RequestParam String nombre) {
        emailUseCase.enviarBienvenida(to, nombre);
    }

    @PostMapping("/confirmacion-orden")
    @PreAuthorize("hasRole('ADMIN')")
    public void confirmacion(@RequestParam String to, @RequestParam String nombre, @RequestParam String codigo, @RequestParam String total) {
        emailUseCase.enviarConfirmacionOrden(to, nombre, codigo, total);
    }

    @PostMapping("/entregado")
    @PreAuthorize("hasRole('ADMIN')")
    public void entregado(@RequestParam String to, @RequestParam String nombre, @RequestParam String codigo) {
        emailUseCase.enviarEntregado(to, nombre, codigo);
    }
}
