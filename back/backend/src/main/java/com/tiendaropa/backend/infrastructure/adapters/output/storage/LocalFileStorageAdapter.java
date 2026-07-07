package com.tiendaropa.backend.infrastructure.adapters.output.storage;

import com.tiendaropa.backend.application.ports.output.FileStoragePort;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Component
public class LocalFileStorageAdapter implements FileStoragePort {

    private final Path uploadsDir = Path.of("uploads");

    public LocalFileStorageAdapter() {
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
            return "/uploads/" + name;
        } catch (IOException e) {
            throw new RuntimeException("No se pudo guardar archivo", e);
        }
    }
}
