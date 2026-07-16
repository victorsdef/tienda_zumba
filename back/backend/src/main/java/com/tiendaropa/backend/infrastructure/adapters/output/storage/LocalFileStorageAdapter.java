package com.tiendaropa.backend.infrastructure.adapters.output.storage;

import com.tiendaropa.backend.application.ports.output.FileStoragePort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Component
public class LocalFileStorageAdapter implements FileStoragePort {

    private final Path uploadsDir;
    private final String appBaseUrl;

    public LocalFileStorageAdapter(
        @Value("${app.upload.dir:uploads}") String uploadDir,
        @Value("${app.base-url:http://localhost:8080}") String appBaseUrl
    ) {
        this.uploadsDir = Path.of(uploadDir).toAbsolutePath().normalize();
        this.appBaseUrl = appBaseUrl.replaceAll("/+$", "");
        try { Files.createDirectories(uploadsDir); } catch (IOException ignored) {}
    }

    @Override
    public String store(MultipartFile file) {
        String ext = "";
        String original = file.getOriginalFilename();
        if (original != null && original.contains(".")) ext = original.substring(original.lastIndexOf('.'));
        String name = UUID.randomUUID().toString() + ext;
        Path target = uploadsDir.resolve(name);
        try {
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return appBaseUrl + "/uploads/" + name;
        } catch (IOException e) {
            throw new RuntimeException("No se pudo guardar archivo", e);
        }
    }
}
