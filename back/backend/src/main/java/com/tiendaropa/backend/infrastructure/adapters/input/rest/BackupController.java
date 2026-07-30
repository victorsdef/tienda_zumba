package com.tiendaropa.backend.infrastructure.adapters.input.rest;

import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.BackupEntity;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.repository.BackupJpaRepository;
import com.tiendaropa.backend.infrastructure.backup.BackupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/nueva-arquitectura/admin/backups", "/api/admin/backups"})
@RequiredArgsConstructor
public class BackupController {

    private final BackupJpaRepository backupRepo;
    private final BackupService backupService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<BackupEntity> listar() {
        return backupRepo.findAllByOrderByFechaProcesoDesc();
    }

    @PostMapping("/ejecutar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BackupEntity> ejecutarAhora() {
        return ResponseEntity.ok(backupService.crearBackup(true));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        backupRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
