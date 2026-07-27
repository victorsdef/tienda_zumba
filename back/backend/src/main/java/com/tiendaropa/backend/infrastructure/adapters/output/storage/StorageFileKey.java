package com.tiendaropa.backend.infrastructure.adapters.output.storage;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

final class StorageFileKey {
    private StorageFileKey() {}

    static String sha256(byte[] bytes) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 no está disponible", e);
        }
    }

    static String safeExtension(String originalFilename, String contentType) {
        if (originalFilename != null) {
            int dot = originalFilename.lastIndexOf('.');
            if (dot >= 0 && dot < originalFilename.length() - 1) {
                String extension = originalFilename.substring(dot).toLowerCase();
                if (extension.matches("\\.[a-z0-9]{1,8}")) return extension;
            }
        }
        if (contentType == null) return "";
        return switch (contentType.toLowerCase()) {
            case "image/png" -> ".png";
            case "image/jpeg" -> ".jpg";
            case "image/gif" -> ".gif";
            case "image/webp" -> ".webp";
            case "image/svg+xml" -> ".svg";
            case "image/avif" -> ".avif";
            default -> "";
        };
    }
}
