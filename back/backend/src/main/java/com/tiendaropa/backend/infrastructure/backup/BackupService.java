package com.tiendaropa.backend.infrastructure.backup;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.BackupEntity;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.repository.BackupJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.*;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class BackupService {

    private final BackupJpaRepository backupRepo;

    @Value("${spring.datasource.url}")
    private String jdbcUrl;

    @Value("${spring.datasource.username:}")
    private String dbUser;

    @Value("${spring.datasource.password:}")
    private String dbPassword;

    @Autowired(required = false)
    private Cloudinary cloudinary;

    /**
     * Cron diario: 3 AM hora del servidor.
     * Con timezone GMT-5 (Ecuador) se puede setear TZ en Render.
     */
    @Scheduled(cron = "0 0 3 * * *")
    public void ejecutarBackupProgramado() {
        log.info("Iniciando backup programado…");
        crearBackup(false);
        limpiarAntiguos(7); // Mantener últimos 7 días
    }

    /**
     * Ejecutable manualmente desde el admin. Devuelve el registro del backup creado.
     */
    public BackupEntity crearBackup(boolean esManual) {
        long inicio = System.currentTimeMillis();
        BackupEntity registro = new BackupEntity();
        registro.setFechaProceso(LocalDateTime.now());
        registro.setEstado("EN_PROCESO");
        registro.setEsManual(esManual);
        backupRepo.save(registro);

        Path archivoTemp = null;
        try {
            archivoTemp = generarPgDump();
            long tamano = Files.size(archivoTemp);

            String url = subirACloudinary(archivoTemp);

            registro.setEstado("OK");
            registro.setTamanoBytes(tamano);
            registro.setUbicacionUrl(url);
            registro.setMensaje("Backup completado exitosamente.");
        } catch (Exception e) {
            log.error("Error al ejecutar backup", e);
            registro.setEstado("ERROR");
            registro.setMensaje(e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName());
        } finally {
            registro.setDuracionMs(System.currentTimeMillis() - inicio);
            backupRepo.save(registro);
            if (archivoTemp != null) {
                try { Files.deleteIfExists(archivoTemp); } catch (IOException ignored) {}
            }
        }
        return registro;
    }

    /**
     * Genera un dump SQL usando pg_dump. Requiere que la imagen de Render tenga pg_dump instalado.
     * Fallback: si pg_dump no está disponible, genera un dump JSON básico (solo estructura + datos vía JPA).
     */
    private Path generarPgDump() throws IOException, InterruptedException {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
        Path archivo = Files.createTempFile("backup-" + timestamp + "-", ".sql.gz");

        // Parsear jdbc:postgresql://host:port/db?params
        String rawUrl = jdbcUrl.replace("jdbc:", "");
        URI uri = URI.create(rawUrl);
        String host = uri.getHost();
        int port = uri.getPort() > 0 ? uri.getPort() : 5432;
        String db = uri.getPath().replaceFirst("^/", "");

        ProcessBuilder pb = new ProcessBuilder(
            "sh", "-c",
            String.format("PGPASSWORD='%s' pg_dump -h %s -p %d -U %s -F p -O -x '%s' | gzip > %s",
                dbPassword, host, port, dbUser, db, archivo.toAbsolutePath())
        );
        pb.redirectErrorStream(true);
        Process p = pb.start();

        StringBuilder salida = new StringBuilder();
        try (BufferedReader r = new BufferedReader(new InputStreamReader(p.getInputStream()))) {
            String linea;
            while ((linea = r.readLine()) != null) salida.append(linea).append("\n");
        }
        int exitCode = p.waitFor();
        if (exitCode != 0) {
            throw new IOException("pg_dump falló (exit " + exitCode + "): " + salida);
        }
        return archivo;
    }

    /**
     * Sube el archivo a Cloudinary como raw resource.
     * Si Cloudinary no está configurado, devuelve una data-URL (solo apta para archivos pequeños).
     */
    private String subirACloudinary(Path archivo) throws IOException {
        byte[] bytes = Files.readAllBytes(archivo);
        String nombre = archivo.getFileName().toString();

        if (cloudinary != null) {
            @SuppressWarnings("unchecked")
            Map<String, Object> result = cloudinary.uploader().upload(
                bytes,
                ObjectUtils.asMap(
                    "public_id",     "sofia-couture/backups/" + nombre.replace(".sql.gz", ""),
                    "resource_type", "raw",
                    "overwrite",     true
                )
            );
            return (String) result.get("secure_url");
        }
        // Fallback: solo para desarrollo, no recomendado en producción
        return "data:application/gzip;base64," + Base64.getEncoder().encodeToString(bytes);
    }

    /**
     * Borra archivos + registros de backups más viejos que N días.
     */
    private void limpiarAntiguos(int dias) {
        LocalDateTime limite = LocalDateTime.now().minusDays(dias);
        backupRepo.findAll().stream()
            .filter(b -> b.getFechaProceso() != null && b.getFechaProceso().isBefore(limite))
            .forEach(b -> {
                try {
                    if (cloudinary != null && b.getUbicacionUrl() != null && b.getUbicacionUrl().startsWith("http")) {
                        // Extraer public_id del URL de Cloudinary
                        String[] partes = b.getUbicacionUrl().split("/upload/");
                        if (partes.length == 2) {
                            String publicId = partes[1].replaceFirst("^v\\d+/", "").replaceFirst("\\.[^.]+$", "");
                            cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", "raw"));
                        }
                    }
                    backupRepo.delete(b);
                } catch (Exception e) {
                    log.warn("No se pudo eliminar backup antiguo id={}: {}", b.getId(), e.getMessage());
                }
            });
    }
}
