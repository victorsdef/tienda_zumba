package com.tiendaropa.backend.application.ports.output;

import org.springframework.web.multipart.MultipartFile;

public interface FileStoragePort {
    String store(MultipartFile file);
}
