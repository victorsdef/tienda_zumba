package com.tiendaropa.backend.infrastructure.adapters.input.rest;

import com.tiendaropa.backend.application.ports.input.FileUploadUseCase;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.common.FileUploadResponse;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.common.UploadUrlRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.net.URLConnection;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Objects;

@RestController
@RequestMapping({"/api/nueva-arquitectura/files", "/api/files"})
@RequiredArgsConstructor
public class FileUploadController {

    private final FileUploadUseCase fileUploadUseCase;

    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('ADMIN','VENDEDOR','BODEGUERO')")
    public ResponseEntity<FileUploadResponse> upload(@RequestParam("file") MultipartFile file) {
        String url = fileUploadUseCase.upload(file);
        return ResponseEntity.ok(new FileUploadResponse(url));
    }

    @PostMapping("/upload-url")
    @PreAuthorize("hasAnyRole('ADMIN','VENDEDOR','BODEGUERO')")
    public ResponseEntity<FileUploadResponse> uploadFromUrl(@RequestBody UploadUrlRequest request) throws IOException {
        if (request == null || request.url() == null || request.url().isBlank()) {
            throw new IllegalArgumentException("La URL de la imagen es obligatoria");
        }

        URL remoteUrl = new URL(request.url().trim());
        URLConnection connection = remoteUrl.openConnection();
        connection.setConnectTimeout(10000);
        connection.setReadTimeout(15000);

        byte[] bytes;
        try (InputStream inputStream = connection.getInputStream()) {
            bytes = inputStream.readAllBytes();
        }

        String contentType = connection.getContentType();
        String filename = resolveFilename(remoteUrl, contentType);
        MultipartFile multipartFile = new SimpleMultipartFile("file", filename, contentType, bytes);
        String url = fileUploadUseCase.upload(multipartFile);
        return ResponseEntity.ok(new FileUploadResponse(url));
    }

    private String resolveFilename(URL remoteUrl, String contentType) {
        String candidate = Path.of(remoteUrl.getPath()).getFileName() != null
            ? Path.of(remoteUrl.getPath()).getFileName().toString()
            : "imagen";
        if (candidate.isBlank() || !candidate.contains(".")) {
            String extension = guessExtension(contentType);
            candidate = extension.isBlank() ? "imagen" : "imagen." + extension;
        }
        return candidate;
    }

    private String guessExtension(String contentType) {
        if (contentType == null || contentType.isBlank()) {
            return "";
        }
        return switch (contentType.toLowerCase()) {
            case "image/jpeg" -> "jpg";
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            case "image/gif" -> "gif";
            case "image/svg+xml" -> "svg";
            case "image/avif" -> "avif";
            default -> "";
        };
    }

    private record SimpleMultipartFile(
        String name,
        String originalFilename,
        String contentType,
        byte[] bytes
    ) implements MultipartFile {

        @Override
        public String getName() {
            return name;
        }

        @Override
        public String getOriginalFilename() {
            return originalFilename;
        }

        @Override
        public String getContentType() {
            return contentType;
        }

        @Override
        public boolean isEmpty() {
            return bytes == null || bytes.length == 0;
        }

        @Override
        public long getSize() {
            return bytes == null ? 0 : bytes.length;
        }

        @Override
        public byte[] getBytes() {
            return Objects.requireNonNullElseGet(bytes, () -> new byte[0]);
        }

        @Override
        public InputStream getInputStream() {
            return new ByteArrayInputStream(getBytes());
        }

        @Override
        public void transferTo(java.io.File dest) throws IOException, IllegalStateException {
            Files.write(dest.toPath(), getBytes());
        }
    }
}
