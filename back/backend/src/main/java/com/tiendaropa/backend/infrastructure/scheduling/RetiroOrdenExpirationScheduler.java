package com.tiendaropa.backend.infrastructure.scheduling;

import com.tiendaropa.backend.application.ports.input.OrdenUseCase;
import com.tiendaropa.backend.domain.model.Orden;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class RetiroOrdenExpirationScheduler {

    private static final long TRES_HORAS_EN_MINUTOS = 180;
    private final OrdenUseCase ordenUseCase;

    @Scheduled(fixedDelayString = "${app.retiro.expiration-check-ms:60000}")
    @Transactional
    public void cancelarRetirosSinConfirmar() {
        LocalDateTime limite = LocalDateTime.now().minusMinutes(TRES_HORAS_EN_MINUTOS);

        for (Orden orden : ordenUseCase.listarTodas()) {
            if (!"RETIRO".equalsIgnoreCase(orden.getTipoEntrega())
                    || !"PENDIENTE".equalsIgnoreCase(orden.getEstado())
                    || orden.getFechaCreacion() == null
                    || orden.getFechaCreacion().isAfter(limite)) {
                continue;
            }

            orden.setEstado("CANCELADO");
            ordenUseCase.actualizar(orden);
            log.info("Pedido de retiro {} cancelado automáticamente después de 3 horas",
                orden.getCodigoOrden() != null ? orden.getCodigoOrden() : orden.getId());
        }
    }
}
