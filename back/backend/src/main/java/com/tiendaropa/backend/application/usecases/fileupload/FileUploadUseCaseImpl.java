package com.tiendaropa.backend.application.usecases.fileupload;

import com.tiendaropa.backend.application.ports.input.FileUploadUseCase;
import com.tiendaropa.backend.application.ports.output.FileStoragePort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class FileUploadUseCaseImpl implements FileUploadUseCase {

    private final FileStoragePort storagePort;

    @Override
    public String upload(MultipartFile file) {
        return storagePort.store(file);
    }
}
