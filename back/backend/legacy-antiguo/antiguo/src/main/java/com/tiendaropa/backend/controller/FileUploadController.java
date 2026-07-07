package com.tiendaropa.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileUploadController {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('ADMIN','VENDEDOR')")
    public ResponseEntity<Map<String, String>> upload(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "Archivo vacío"));

        String ext = "";
        String original = file.getOriginalFilename();
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf('.'));
        }
        String filename = UUID.randomUUID() + ext;

        Path dir = Paths.get(uploadDir);
        Files.createDirectories(dir);
        Files.copy(file.getInputStream(), dir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);

        String url = "/api/files/" + filename;
        return ResponseEntity.ok(Map.of("url", url));
    }

    @PostMapping("/upload-url")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> uploadFromUrl(@RequestBody Map<String, String> body) throws IOException, InterruptedException {
        String imageUrl = body.get("url");
        if (imageUrl == null || imageUrl.isBlank()) return ResponseEntity.badRequest().body(Map.of("error", "URL vacía"));

        HttpClient client = HttpClient.newBuilder()
            .followRedirects(HttpClient.Redirect.ALWAYS)
            .build();
        HttpRequest req = HttpRequest.newBuilder()
            .uri(URI.create(imageUrl))
            .header("User-Agent", "Mozilla/5.0")
            .GET().build();

        HttpResponse<InputStream> response = client.send(req, HttpResponse.BodyHandlers.ofInputStream());
        if (response.statusCode() >= 400) {
            return ResponseEntity.badRequest().body(Map.of("error", "No se pudo descargar la imagen (HTTP " + response.statusCode() + ")"));
        }

        String ct = response.headers().firstValue("Content-Type").orElse("");
        if (!ct.startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of("error", "La URL no apunta a una imagen. Asegurate de usar un enlace directo a un archivo de imagen (jpg, png, webp, etc.)"));
        }

        String ext = ".jpg";
        if (ct.contains("png")) ext = ".png";
        else if (ct.contains("webp")) ext = ".webp";
        else if (ct.contains("gif")) ext = ".gif";

        String filename = UUID.randomUUID() + ext;
        Path dir = Paths.get(uploadDir);
        Files.createDirectories(dir);
        Files.copy(response.body(), dir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);

        return ResponseEntity.ok(Map.of("url", "/api/files/" + filename));
    }

    @GetMapping("/{filename:.+}")
    public ResponseEntity<byte[]> get(@PathVariable String filename) throws IOException {
        Path path = Paths.get(uploadDir).resolve(filename).normalize();
        if (!Files.exists(path)) return ResponseEntity.notFound().build();

        byte[] bytes = Files.readAllBytes(path);
        String contentType = Files.probeContentType(path);
        if (contentType == null) contentType = "application/octet-stream";

        return ResponseEntity.ok()
            .header("Content-Type", contentType)
            .header("Cache-Control", "max-age=31536000")
            .body(bytes);
    }
}
