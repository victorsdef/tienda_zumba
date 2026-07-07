package com.tiendaropa.backend.infrastructure.adapters.output.pdf;

import com.tiendaropa.backend.application.ports.output.PdfGeneratorPort;
import com.tiendaropa.backend.domain.model.Orden;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

@Component
public class PdfGeneratorAdapter implements PdfGeneratorPort {

    @Override
    public byte[] generarFactura(Orden orden) {
        String id = orden.getCodigoOrden() != null ? orden.getCodigoOrden() : (orden.getId() != null ? "#" + orden.getId() : "-" );
        String content = "%PDF-1.4\n%Simulated PDF for orden " + id + "\n";
        return content.getBytes(StandardCharsets.UTF_8);
    }
}
