package com.tiendaropa.backend.infrastructure.adapters.input.rest;

import com.tiendaropa.backend.application.ports.input.EmailUseCase;
import com.tiendaropa.backend.domain.model.Orden;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/nueva-arquitectura/email", "/api/email"})
@RequiredArgsConstructor
public class EmailController {

    private final EmailUseCase emailUseCase;

    @PostMapping("/verificacion")
    public void verificacion(@RequestParam String to, @RequestParam String nombre, @RequestParam String token) {
        emailUseCase.enviarVerificacion(to, nombre, token);
    }

    @PostMapping("/bienvenida")
    public void bienvenida(@RequestParam String to, @RequestParam String nombre) {
        emailUseCase.enviarBienvenida(to, nombre);
    }

    @PostMapping("/confirmacion-orden")
    public void confirmacion(@RequestParam String to, @RequestParam String nombre, @RequestParam String codigo, @RequestParam String total) {
        emailUseCase.enviarConfirmacionOrden(to, nombre, codigo, total);
    }

    @PostMapping("/entregado")
    public void entregado(@RequestParam String to, @RequestParam String nombre, @RequestParam String codigo) {
        emailUseCase.enviarEntregado(to, nombre, codigo);
    }
}
