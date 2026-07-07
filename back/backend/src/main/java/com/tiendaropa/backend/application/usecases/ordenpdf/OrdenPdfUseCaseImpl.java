package com.tiendaropa.backend.application.usecases.ordenpdf;

import com.tiendaropa.backend.application.ports.input.OrdenPdfUseCase;
import com.tiendaropa.backend.application.ports.output.PdfGeneratorPort;
import com.tiendaropa.backend.application.ports.input.OrdenUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrdenPdfUseCaseImpl implements OrdenPdfUseCase {

    private final OrdenUseCase ordenUseCase;
    private final PdfGeneratorPort pdfGeneratorPort;

    @Override
    public byte[] generarFacturaPdf(Long ordenId) {
        return ordenUseCase.obtenerPorId(ordenId)
                .map(pdfGeneratorPort::generarFactura)
                .orElse(new byte[0]);
    }
}
