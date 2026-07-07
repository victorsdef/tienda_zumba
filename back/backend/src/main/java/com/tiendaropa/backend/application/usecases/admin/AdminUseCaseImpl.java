package com.tiendaropa.backend.application.usecases.admin;

import com.tiendaropa.backend.application.ports.input.AdminUseCase;
import com.tiendaropa.backend.application.ports.output.OrdenRepositoryPort;
import com.tiendaropa.backend.domain.model.Orden;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUseCaseImpl implements AdminUseCase {

    private final OrdenRepositoryPort ordenRepository;

    @Override
    public byte[] generarReporteVentasCsv(LocalDate desde, LocalDate hasta) {
        List<Orden> todas = ordenRepository.findAll();
        LocalDateTime inicio = desde != null ? desde.atStartOfDay() : LocalDate.MIN.atStartOfDay();
        LocalDateTime fin = hasta != null ? hasta.atTime(23,59,59) : LocalDate.MAX.atStartOfDay();

        List<Orden> filtradas = todas.stream()
                .filter(o -> o.getFechaCreacion() != null && ( !o.getFechaCreacion().isBefore(inicio) && !o.getFechaCreacion().isAfter(fin)))
                .collect(Collectors.toList());

        StringBuilder sb = new StringBuilder();
        sb.append("id,codigo,fecha,total,usuarioId,estado\n");
        for (Orden o : filtradas) {
            sb.append(o.getId()).append(",")
                    .append(o.getCodigoOrden() != null ? o.getCodigoOrden() : "").append(",")
                    .append(o.getFechaCreacion()).append(",")
                    .append(o.getTotal() != null ? o.getTotal() : "").append(",")
                    .append(o.getUsuarioId() != null ? o.getUsuarioId() : "").append(",")
                    .append(o.getEstado() != null ? o.getEstado() : "").append("\n");
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }
}
