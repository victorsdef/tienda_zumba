package com.tiendaropa.backend.application.ports.input;

import org.springframework.web.multipart.MultipartFile;

public interface FileUploadUseCase {
    String upload(MultipartFile file);
}
