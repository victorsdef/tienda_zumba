package com.tiendaropa.backend.infrastructure.adapters.output.storage;

import com.tiendaropa.backend.application.ports.output.FileStoragePort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Component
@ConditionalOnMissingBean(CloudinaryStorageAdapter.class)
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
        try {
            byte[] bytes = file.getBytes();
            String extension = StorageFileKey.safeExtension(file.getOriginalFilename(), file.getContentType());
            String name = StorageFileKey.sha256(bytes) + extension;
            Path target = uploadsDir.resolve(name);
            if (!Files.exists(target)) Files.write(target, bytes);
            return appBaseUrl + "/uploads/" + name;
        } catch (IOException e) {
            throw new RuntimeException("No se pudo guardar archivo", e);
        }
    }
}
