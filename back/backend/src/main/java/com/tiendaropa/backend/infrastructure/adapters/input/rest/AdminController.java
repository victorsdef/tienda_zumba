package com.tiendaropa.backend.infrastructure.adapters.input.rest;

import com.tiendaropa.backend.application.ports.input.AdminUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping({"/api/nueva-arquitectura/admin", "/api/admin"})
@RequiredArgsConstructor
public class AdminController {

    private final AdminUseCase adminUseCase;

    @GetMapping("/report/ventas")
    public ResponseEntity<byte[]> exportVentas(@RequestParam(required = false) String desde,
                                               @RequestParam(required = false) String hasta) {
        LocalDate d = desde != null ? LocalDate.parse(desde) : null;
        LocalDate h = hasta != null ? LocalDate.parse(hasta) : null;
        byte[] csv = adminUseCase.generarReporteVentasCsv(d, h);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        headers.setContentDisposition(ContentDisposition.attachment().filename("ventas.csv").build());
        return new ResponseEntity<>(csv, headers, HttpStatus.OK);
    }
}
