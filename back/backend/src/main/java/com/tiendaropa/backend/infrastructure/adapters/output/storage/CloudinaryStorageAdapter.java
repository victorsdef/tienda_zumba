package com.tiendaropa.backend.infrastructure.adapters.output.storage;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.tiendaropa.backend.application.ports.output.FileStoragePort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Component
@ConditionalOnProperty(name = "cloudinary.cloud-name")
public class CloudinaryStorageAdapter implements FileStoragePort {

    private final Cloudinary cloudinary;

    public CloudinaryStorageAdapter(
        @Value("${cloudinary.cloud-name}") String cloudName,
        @Value("${cloudinary.api-key}") String apiKey,
        @Value("${cloudinary.api-secret}") String apiSecret
    ) {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
            "cloud_name", cloudName,
            "api_key",    apiKey,
            "api_secret", apiSecret,
            "secure",     true
        ));
    }

    @Override
    @SuppressWarnings("unchecked")
    public String store(MultipartFile file) {
        try {
            byte[] bytes = file.getBytes();
            String publicId = "sofia-couture/" + StorageFileKey.sha256(bytes);

            try {
                Map<String, Object> existing = cloudinary.api().resource(
                    publicId,
                    ObjectUtils.asMap("resource_type", "image")
                );
                Object existingUrl = existing.get("secure_url");
                if (existingUrl instanceof String url && !url.isBlank()) return url;
            } catch (Exception ignored) {
                // El recurso no existe: se crea usando la huella como identificador.
            }

            Map<String, Object> result = cloudinary.uploader().upload(
                bytes,
                ObjectUtils.asMap(
                    "public_id",       publicId,
                    "resource_type",  "image",
                    "overwrite",      false,
                    "unique_filename", false
                )
            );
            return (String) result.get("secure_url");
        } catch (IOException e) {
            throw new RuntimeException("Error al subir imagen a Cloudinary", e);
        }
    }
}
